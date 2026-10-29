package com.nextrole.sync.util;

import java.util.List;
import java.util.regex.Pattern;

/**
 * Normalizes location and country strings for jobs ingested from ATS providers.
 * Enforces strict India-first verification rules:
 *  - Blank/null locations are classified as Unknown (never defaulted to India).
 *  - Generic Remote is preserved as Remote (never assumed to be India).
 *  - Explicit Indian cities, states, and country markers are normalized to "India".
 *  - Foreign cities, states, and countries are preserved and excluded from India.
 */
public final class CountryDetector {

    private CountryDetector() {}

    private static final Pattern INDIA_WORD_PATTERN = Pattern.compile(
            "\\b(india|bharat|in)\\b",
            Pattern.CASE_INSENSITIVE
    );

    private static final List<String> INDIAN_CITIES_AND_STATES = List.of(
            "bengaluru", "bangalore",
            "hyderabad", "secunderabad",
            "pune",
            "chennai", "madras",
            "mumbai", "bombay", "navi mumbai", "thane",
            "delhi", "new delhi", "noida", "greater noida", "gurgaon", "gurugram", "faridabad", "ghaziabad", "ncr",
            "kolkata", "calcutta",
            "ahmedabad", "gandhinagar", "vadodara", "surat",
            "jaipur",
            "kochi", "cochin", "thiruvananthapuram", "trivandrum", "kozhikode", "calicut",
            "coimbatore",
            "chandigarh", "mohali",
            "indore", "bhopal",
            "bhubaneswar", "cuttack",
            "visakhapatnam", "vizag", "vijayawada",
            "mysuru", "mysore", "mangalore", "mangaluru", "hubli", "dharwad",
            "nagpur", "nashik",
            "lucknow", "kanpur",
            "patna", "ranchi", "guwahati",
            "karnataka", "telangana", "maharashtra", "tamil nadu", "haryana",
            "uttar pradesh", "kerala", "gujarat", "andhra pradesh", "west bengal",
            "odisha", "punjab", "rajasthan", "madhya pradesh", "bihar", "assam", "goa"
    );

    private static final List<String> NON_INDIA_REGIONS = List.of(
            "united states", "usa", "us", "u.s.", "u.s.a.", "uk", "u.k.", "united kingdom",
            "canada", "germany", "france", "australia", "singapore", "netherlands",
            "ireland", "spain", "poland", "japan", "brazil", "mexico", "switzerland",
            "sweden", "austria", "belgium", "israel", "uae", "dubai", "philippines",
            "vietnam", "indonesia", "thailand", "chile", "ecuador", "romania", "china",
            "emea", "apac", "latam", "americas", "europe", "north america"
    );

    public static String detectCountry(String location) {
        return detectCountry(location, null);
    }

    public static String detectCountry(String location, String rawCountry) {
        String loc = location != null ? location.trim() : "";
        String raw = rawCountry != null ? rawCountry.trim() : "";

        if (loc.isEmpty() && raw.isEmpty()) {
            return "Unknown";
        }

        String combined = (loc + " " + raw).trim().toLowerCase();

        // 1. Explicit India mentions
        if (isIndiaLocation(combined)) {
            return "India";
        }

        // 2. Remote check - do NOT assume generic Remote is India
        if (isRemote(combined)) {
            // Only if combined specifically mentions India
            if (isIndiaLocation(combined)) {
                return "India";
            }
            // Check if foreign remote
            for (String reg : NON_INDIA_REGIONS) {
                if (combined.contains(reg)) {
                    return capitalizeWords(reg);
                }
            }
            return "Remote";
        }

        // 3. Foreign region / country match
        for (String reg : NON_INDIA_REGIONS) {
            if (combined.contains(reg)) {
                return capitalizeWords(reg);
            }
        }

        // 4. Extract country from comma-separated location: "City, Country"
        if (loc.contains(",")) {
            String[] parts = loc.split(",");
            String lastPart = parts[parts.length - 1].trim();
            if (!lastPart.isEmpty() && !lastPart.equalsIgnoreCase("remote")) {
                if (isIndiaLocation(lastPart.toLowerCase())) {
                    return "India";
                }
                return lastPart;
            }
        }

        if (!raw.isEmpty()) {
            return raw;
        }

        return !loc.isEmpty() ? loc : "Unknown";
    }

    public static boolean isIndiaLocation(String lowerText) {
        if (lowerText == null || lowerText.isBlank()) {
            return false;
        }
        String lower = lowerText.toLowerCase();

        // Check word boundaries for "india", "in", "bharat"
        if (INDIA_WORD_PATTERN.matcher(lower).find()) {
            return true;
        }

        for (String cityOrState : INDIAN_CITIES_AND_STATES) {
            if (lower.contains(cityOrState)) {
                return true;
            }
        }

        return false;
    }

    private static boolean isRemote(String lowerText) {
        return lowerText.contains("remote") ||
                lowerText.contains("anywhere") ||
                lowerText.contains("work from home") ||
                lowerText.contains("wfh") ||
                lowerText.contains("worldwide") ||
                lowerText.contains("global");
    }

    private static String capitalizeWords(String text) {
        if (text == null || text.isBlank()) return text;
        if (text.equalsIgnoreCase("us") || text.equalsIgnoreCase("usa")) return "United States";
        if (text.equalsIgnoreCase("uk")) return "United Kingdom";
        if (text.equalsIgnoreCase("uae")) return "United Arab Emirates";
        if (text.equalsIgnoreCase("emea")) return "EMEA";
        if (text.equalsIgnoreCase("apac")) return "APAC";
        if (text.equalsIgnoreCase("latam")) return "LATAM";

        String[] words = text.split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (String w : words) {
            if (!w.isEmpty()) {
                sb.append(Character.toUpperCase(w.charAt(0)))
                  .append(w.substring(1).toLowerCase())
                  .append(" ");
            }
        }
        return sb.toString().trim();
    }
}
