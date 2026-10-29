package com.nextrole.security;

import com.nextrole.enums.RiskLabel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.net.*;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;

@Component
@Slf4j
public class UrlSecurityValidator {

    private static final Set<String> ALLOWED_SCHEMES = Set.of("http", "https");
    private static final Set<String> KNOWN_ATS_DOMAINS = Set.of(
            "greenhouse.io", "boards.greenhouse.io",
            "lever.co", "jobs.lever.co",
            "ashbyhq.com", "jobs.ashbyhq.com",
            "smartrecruiters.com", "jobs.smartrecruiters.com",
            "workable.com", "apply.workable.com",
            "myworkdayjobs.com", "taleo.net", "icims.com",
            "jobvite.com", "bamboohr.com", "recruitee.com",
            "zohorecruit.in", "zohorecruit.com", "keka.com", "darwinbox.com"
    );

    public record SecurityScanResult(
            RiskLabel riskLabel,
            int threatScore,
            List<String> riskFlags,
            String normalizedUrl,
            String finalDestinationUrl,
            boolean reachable,
            String scannerSource
    ) {}

    /**
     * Inspects a candidate application URL for SSRF, phishing indicators, and domain trust.
     */
    public SecurityScanResult validateUrl(String candidateUrl, String companyWebsite) {
        List<String> flags = new ArrayList<>();
        int threatScore = 0;

        if (candidateUrl == null || candidateUrl.isBlank()) {
            return new SecurityScanResult(RiskLabel.MALICIOUS, 100, List.of("EMPTY_URL"), null, null, false, "Internal Validator");
        }

        URI uri;
        try {
            uri = URI.create(candidateUrl.trim());
        } catch (Exception e) {
            return new SecurityScanResult(RiskLabel.MALICIOUS, 100, List.of("INVALID_URI_SYNTAX"), candidateUrl, null, false, "Internal Validator");
        }

        String scheme = uri.getScheme();
        if (scheme == null || !ALLOWED_SCHEMES.contains(scheme.toLowerCase())) {
            return new SecurityScanResult(RiskLabel.MALICIOUS, 100, List.of("DISALLOWED_PROTOCOL: " + scheme), candidateUrl, null, false, "Internal Validator");
        }

        if (!"https".equalsIgnoreCase(scheme)) {
            flags.add("INSECURE_HTTP_SCHEME");
            threatScore += 20;
        }

        String host = uri.getHost();
        if (host == null || host.isBlank()) {
            return new SecurityScanResult(RiskLabel.MALICIOUS, 100, List.of("MISSING_HOSTNAME"), candidateUrl, null, false, "Internal Validator");
        }

        host = host.toLowerCase().trim();

        // 1. SSRF Protection: Check for private, loopback, link-local, and cloud metadata IPs
        try {
            InetAddress[] addresses = InetAddress.getAllByName(host);
            for (InetAddress addr : addresses) {
                if (isPrivateOrReservedIp(addr)) {
                    log.warn("Blocked SSRF attempt to restricted IP {} from host {}", addr.getHostAddress(), host);
                    return new SecurityScanResult(RiskLabel.MALICIOUS, 100,
                            List.of("SSRF_VIOLATION: Restricted IP (" + addr.getHostAddress() + ")"),
                            candidateUrl, null, false, "SSRF Guard");
                }
            }
        } catch (UnknownHostException e) {
            flags.add("DNS_RESOLUTION_FAILED");
            threatScore += 40;
            return new SecurityScanResult(RiskLabel.UNAVAILABLE, Math.max(threatScore, 50), flags, candidateUrl, null, false, "Internal Validator");
        }

        // 2. Lookalike / Punycode / Suspicious domain patterns
        if (host.startsWith("xn--") || host.contains(".xn--")) {
            flags.add("PUNYCODE_HOMOGRAPH_DOMAIN");
            threatScore += 50;
        }

        // Suspicious TLDs
        List<String> suspiciousTlds = List.of(".click", ".top", ".xyz", ".tk", ".cf", ".ml", ".gq", ".ga", ".rest", ".bar");
        for (String tld : suspiciousTlds) {
            if (host.endsWith(tld)) {
                flags.add("HIGH_RISK_TLD: " + tld);
                threatScore += 35;
                break;
            }
        }

        // Credentials in URL
        if (candidateUrl.contains("@")) {
            flags.add("EMBEDDED_CREDENTIALS_IN_URL");
            threatScore += 30;
        }

        // 3. Domain match check with company website or known ATS
        boolean domainTrusted = isDomainTrusted(host, companyWebsite);
        if (!domainTrusted) {
            flags.add("DOMAIN_MISMATCH: Destination does not match employer website or verified ATS");
            threatScore += 25;
        }

        // 4. Safe connectivity & redirect check (capped at 3 redirects, timeout 5s)
        String finalUrl = candidateUrl;
        boolean reachable = false;
        try {
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(5))
                    .followRedirects(HttpClient.Redirect.NEVER)
                    .build();

            String currentUrl = candidateUrl;
            int redirectCount = 0;
            final int maxRedirects = 3;

            while (redirectCount <= maxRedirects) {
                HttpRequest req = HttpRequest.newBuilder()
                        .uri(URI.create(currentUrl))
                        .timeout(Duration.ofSeconds(5))
                        .header("User-Agent", "NextRole-India-LinkVerifier/1.0 (+https://nextrole-india.onrender.com)")
                        .method("HEAD", HttpRequest.BodyPublishers.noBody())
                        .build();

                HttpResponse<Void> resp = client.send(req, HttpResponse.BodyHandlers.discarding());
                int status = resp.statusCode();

                if (status >= 200 && status < 300) {
                    reachable = true;
                    finalUrl = currentUrl;
                    break;
                } else if (status >= 300 && status < 400) {
                    Optional<String> locationOpt = resp.headers().firstValue("Location");
                    if (locationOpt.isPresent()) {
                        String nextUrl = locationOpt.get();
                        if (!nextUrl.startsWith("http://") && !nextUrl.startsWith("https://")) {
                            URI baseUri = URI.create(currentUrl);
                            nextUrl = baseUri.resolve(nextUrl).toString();
                        }

                        // Validate redirect target for SSRF
                        URI nextUri = URI.create(nextUrl);
                        String nextHost = nextUri.getHost();
                        if (nextHost != null) {
                            InetAddress[] nextAddrs = InetAddress.getAllByName(nextHost);
                            for (InetAddress addr : nextAddrs) {
                                if (isPrivateOrReservedIp(addr)) {
                                    return new SecurityScanResult(RiskLabel.MALICIOUS, 100,
                                            List.of("SSRF_VIOLATION: Redirect to restricted IP (" + addr.getHostAddress() + ")"),
                                            candidateUrl, nextUrl, false, "SSRF Guard");
                                }
                            }
                        }

                        currentUrl = nextUrl;
                        redirectCount++;
                    } else {
                        break;
                    }
                } else if (status == 405 || status == 403) {
                    // Some enterprise job boards block HEAD requests with 403 or 405
                    reachable = true;
                    finalUrl = currentUrl;
                    break;
                } else {
                    flags.add("HTTP_STATUS_" + status);
                    break;
                }
            }

            if (redirectCount > maxRedirects) {
                flags.add("EXCESSIVE_REDIRECTS");
                threatScore += 25;
            }
        } catch (Exception e) {
            log.debug("Link reachability check failed for {}: {}", candidateUrl, e.getMessage());
            flags.add("REACHABILITY_CHECK_FAILED: " + e.getMessage());
            threatScore += 15;
        }

        RiskLabel label;
        if (threatScore >= 60) {
            label = RiskLabel.MALICIOUS;
        } else if (threatScore >= 30) {
            label = RiskLabel.SUSPICIOUS;
        } else if (!reachable && flags.contains("DNS_RESOLUTION_FAILED")) {
            label = RiskLabel.UNAVAILABLE;
        } else {
            label = RiskLabel.LOW_RISK;
        }

        return new SecurityScanResult(label, threatScore, flags, candidateUrl, finalUrl, reachable, "NextRole SSRF & Heuristic Guard");
    }

    private boolean isPrivateOrReservedIp(InetAddress addr) {
        if (addr.isLoopbackAddress() || addr.isSiteLocalAddress() || addr.isLinkLocalAddress() || addr.isAnyLocalAddress() || addr.isMulticastAddress()) {
            return true;
        }

        byte[] bytes = addr.getAddress();
        if (bytes.length == 4) {
            int first = bytes[0] & 0xFF;
            int second = bytes[1] & 0xFF;

            // 127.0.0.0/8 (Loopback)
            if (first == 127) return true;
            // 10.0.0.0/8 (Private)
            if (first == 10) return true;
            // 172.16.0.0/12 (Private)
            if (first == 172 && (second >= 16 && second <= 31)) return true;
            // 192.168.0.0/16 (Private)
            if (first == 192 && second == 168) return true;
            // 169.254.0.0/16 (Link Local / Cloud Metadata e.g. 169.254.169.254)
            if (first == 169 && second == 254) return true;
            // 0.0.0.0/8
            if (first == 0) return true;
            // 100.64.0.0/10 (Carrier-grade NAT)
            if (first == 100 && (second >= 64 && second <= 127)) return true;
        }

        return false;
    }

    private boolean isDomainTrusted(String applyHost, String companyWebsite) {
        // Check known legitimate ATS platforms
        for (String ats : KNOWN_ATS_DOMAINS) {
            if (applyHost.equals(ats) || applyHost.endsWith("." + ats)) {
                return true;
            }
        }

        // Compare with company website domain
        if (companyWebsite != null && !companyWebsite.isBlank()) {
            try {
                URI compUri = URI.create(companyWebsite.trim().startsWith("http") ? companyWebsite.trim() : "https://" + companyWebsite.trim());
                String compHost = compUri.getHost();
                if (compHost != null) {
                    compHost = compHost.toLowerCase().replaceFirst("^www\\.", "");
                    String cleanApplyHost = applyHost.replaceFirst("^www\\.", "");
                    if (cleanApplyHost.equals(compHost) || cleanApplyHost.endsWith("." + compHost)) {
                        return true;
                    }
                }
            } catch (Exception ignored) {
            }
        }

        return false;
    }
}
