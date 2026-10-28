# Company Source Registry — NextRole India

This registry defines the target universe of 100 benchmark technology companies in India, alongside their official career URLs, machine-readable ATS integration types, and integration statuses.

---

## Integration Status Definitions

| Status | Meaning | System Behavior |
|--------|---------|-----------------|
| `ACTIVE_IMPORT` | Official public machine-readable API endpoint (e.g. Greenhouse, Lever, Ashby) verified and tested. | Synchronized automatically every 6 hours by background worker. Listings upserted into database. |
| `NEEDS_VERIFICATION` | Company careers URL verified; ATS slug or public endpoint requires validation or confirmation before activating sync. | Not crawled automatically until verified by administrator. Shown as candidate source. |
| `LINK_ONLY` | Official careers portal is verified, but requires candidate login, uses proprietary/anti-bot systems, or offers no open public API. | Direct link provided to visitors. Never scraped. Safe external redirection. |
| `UNSUPPORTED` | No compliant, authorized, or reliable integration is currently available for automated ingestion. | Monitored for future public API/partnership availability. |
| `DISABLED` | Administratively disabled by the portal operator. | Excluded from synchronization runs. |

---

## Special Aggregators (Out-of-Registry)

| Aggregator | Official Portal | Integration Mode | Operating Policy |
|------------|-----------------|------------------|------------------|
| **Naukri.com** | `https://www.naukri.com/` | `LINK_ONLY` | India's largest lateral tech job portal. Direct search links with URL-encoded query parameters. No private endpoint scraping, CAPTCHA bypass, or cookie harvesting. |
| **Unstop** | `https://unstop.com/` | `LINK_ONLY` | Student challenges, hackathons, graduate recruitment, and internships. Direct referral links. |

---

## 100 Target Companies Directory

### Category 1: Indian IT Services, Consulting & Enterprise Technology (1–25)

| # | Company Name | Official Careers URL | Source Type | Board Identifier | Status |
|---|--------------|----------------------|-------------|------------------|--------|
| 1 | TCS | https://www.tcs.com/careers | UNSUPPORTED | — | `LINK_ONLY` |
| 2 | Infosys | https://www.infosys.com/careers/ | UNSUPPORTED | — | `LINK_ONLY` |
| 3 | Wipro | https://careers.wipro.com/ | UNSUPPORTED | — | `LINK_ONLY` |
| 4 | HCLTech | https://www.hcltech.com/careers | UNSUPPORTED | — | `LINK_ONLY` |
| 5 | Tech Mahindra | https://www.techmahindra.com/careers/ | UNSUPPORTED | — | `LINK_ONLY` |
| 6 | LTIMindtree | https://www.ltimindtree.com/careers/ | UNSUPPORTED | — | `LINK_ONLY` |
| 7 | Mphasis | https://careers.mphasis.com/ | UNSUPPORTED | — | `LINK_ONLY` |
| 8 | Persistent Systems | https://www.persistent.com/careers/ | UNSUPPORTED | — | `LINK_ONLY` |
| 9 | Coforge | https://www.coforge.com/careers | UNSUPPORTED | — | `LINK_ONLY` |
| 10 | Hexaware Technologies | https://hexaware.com/careers/ | UNSUPPORTED | — | `LINK_ONLY` |
| 11 | Accenture | https://www.accenture.com/in-en/careers | UNSUPPORTED | — | `LINK_ONLY` |
| 12 | IBM | https://www.ibm.com/careers | UNSUPPORTED | — | `LINK_ONLY` |
| 13 | Capgemini | https://www.capgemini.com/careers/ | UNSUPPORTED | — | `LINK_ONLY` |
| 14 | Cognizant | https://careers.cognizant.com/ | UNSUPPORTED | — | `LINK_ONLY` |
| 15 | DXC Technology | https://careers.dxc.com/ | UNSUPPORTED | — | `LINK_ONLY` |
| 16 | NTT DATA | https://www.nttdata.com/global/en/careers | UNSUPPORTED | — | `LINK_ONLY` |
| 17 | CGI | https://www.cgi.com/en/careers | UNSUPPORTED | — | `LINK_ONLY` |
| 18 | Kyndryl | https://www.kyndryl.com/us/en/careers | UNSUPPORTED | — | `LINK_ONLY` |
| 19 | Genpact | https://www.genpact.com/careers | UNSUPPORTED | — | `LINK_ONLY` |
| 20 | Oracle | https://www.oracle.com/in/careers/ | UNSUPPORTED | — | `LINK_ONLY` |
| 21 | SAP | https://www.sap.com/about/careers.html | UNSUPPORTED | — | `LINK_ONLY` |
| 22 | Deloitte | https://www.deloitte.com/global/en/careers.html | UNSUPPORTED | — | `LINK_ONLY` |
| 23 | EY | https://www.ey.com/en_in/careers | UNSUPPORTED | — | `LINK_ONLY` |
| 24 | PwC | https://www.pwc.in/careers.html | UNSUPPORTED | — | `LINK_ONLY` |
| 25 | KPMG | https://kpmg.com/in/en/home/careers.html | UNSUPPORTED | — | `LINK_ONLY` |

---

### Category 2: Product, Cloud & Global Technology Companies (26–50)

| # | Company Name | Official Careers URL | Source Type | Board Identifier | Status |
|---|--------------|----------------------|-------------|------------------|--------|
| 26 | Microsoft | https://careers.microsoft.com/ | UNSUPPORTED | — | `LINK_ONLY` |
| 27 | Google | https://www.google.com/about/careers/applications/ | UNSUPPORTED | — | `LINK_ONLY` |
| 28 | Amazon | https://www.amazon.jobs/ | UNSUPPORTED | — | `LINK_ONLY` |
| 29 | Apple | https://www.apple.com/careers/in/ | UNSUPPORTED | — | `LINK_ONLY` |
| 30 | Meta | https://www.metacareers.com/ | UNSUPPORTED | — | `LINK_ONLY` |
| 31 | NVIDIA | https://www.nvidia.com/en-us/about-nvidia/careers/ | UNSUPPORTED | — | `LINK_ONLY` |
| 32 | Intel | https://jobs.intel.com/ | UNSUPPORTED | — | `LINK_ONLY` |
| 33 | Cisco | https://jobs.cisco.com/ | UNSUPPORTED | — | `LINK_ONLY` |
| 34 | Qualcomm | https://careers.qualcomm.com/ | UNSUPPORTED | — | `LINK_ONLY` |
| 35 | AMD | https://www.amd.com/en/corporate/careers.html | UNSUPPORTED | — | `LINK_ONLY` |
| 36 | Dell Technologies | https://jobs.dell.com/ | UNSUPPORTED | — | `LINK_ONLY` |
| 37 | HP | https://jobs.hp.com/ | UNSUPPORTED | — | `LINK_ONLY` |
| 38 | Hewlett Packard Enterprise | https://careers.hpe.com/ | UNSUPPORTED | — | `LINK_ONLY` |
| 39 | Salesforce | https://careers.salesforce.com/ | UNSUPPORTED | — | `LINK_ONLY` |
| 40 | Adobe | https://careers.adobe.com/ | UNSUPPORTED | — | `LINK_ONLY` |
| 41 | ServiceNow | https://careers.servicenow.com/ | UNSUPPORTED | — | `LINK_ONLY` |
| 42 | Broadcom | https://careers.broadcom.com/ | UNSUPPORTED | — | `LINK_ONLY` |
| 43 | Red Hat | https://www.redhat.com/en/jobs | UNSUPPORTED | — | `LINK_ONLY` |
| 44 | PayPal | https://www.paypal.com/us/webapps/mpp/jobs | UNSUPPORTED | — | `LINK_ONLY` |
| 45 | Paytm | https://paytm.com/careers/ | UNSUPPORTED | — | `LINK_ONLY` |
| 46 | PhonePe | https://www.phonepe.com/careers/ | LEVER | `phonepe` | `NEEDS_VERIFICATION` |
| 47 | Razorpay | https://razorpay.com/jobs/ | GREENHOUSE | `razorpay` | `ACTIVE_IMPORT` |
| 48 | Freshworks | https://www.freshworks.com/company/careers/ | GREENHOUSE | `freshworks` | `ACTIVE_IMPORT` |
| 49 | Zoho | https://www.zoho.com/careers.html | UNSUPPORTED | — | `LINK_ONLY` |
| 50 | Atlassian | https://www.atlassian.com/company/careers | LEVER | `atlassian` | `NEEDS_VERIFICATION` |

---

### Category 3: Indian Startups, SaaS, FinTech & Consumer Technology (51–75)

| # | Company Name | Official Careers URL | Source Type | Board Identifier | Status |
|---|--------------|----------------------|-------------|------------------|--------|
| 51 | Flipkart | https://www.flipkartcareers.com/ | UNSUPPORTED | — | `LINK_ONLY` |
| 52 | Myntra | https://careers.myntra.com/ | UNSUPPORTED | — | `LINK_ONLY` |
| 53 | Meesho | https://www.meesho.io/jobs | ASHBY | `meesho` | `NEEDS_VERIFICATION` |
| 54 | Swiggy | https://careers.swiggy.com/ | UNSUPPORTED | — | `LINK_ONLY` |
| 55 | Eternal | https://www.eternal.com/careers/ | UNSUPPORTED | — | `LINK_ONLY` |
| 56 | Groww | https://groww.in/careers | LEVER | `groww` | `NEEDS_VERIFICATION` |
| 57 | CRED | https://careers.cred.club/ | ASHBY | `cred` | `ACTIVE_IMPORT` |
| 58 | Dream Sports | https://www.dreamsports.group/careers | GREENHOUSE | `dreamsports` | `NEEDS_VERIFICATION` |
| 59 | Jio | https://careers.jio.com/ | UNSUPPORTED | — | `LINK_ONLY` |
| 60 | Reliance Retail | https://relianceretail.com/careers.html | UNSUPPORTED | — | `LINK_ONLY` |
| 61 | Tata Digital | https://www.tatadigital.com/careers | UNSUPPORTED | — | `LINK_ONLY` |
| 62 | MakeMyTrip | https://www.makemytrip.com/careers/ | UNSUPPORTED | — | `LINK_ONLY` |
| 63 | Info Edge | https://www.infoedge.in/careers | UNSUPPORTED | — | `LINK_ONLY` |
| 64 | IndiaMART | https://careers.indiamart.com/ | UNSUPPORTED | — | `LINK_ONLY` |
| 65 | InMobi | https://www.inmobi.com/company/careers | GREENHOUSE | `inmobi` | `NEEDS_VERIFICATION` |
| 66 | BrowserStack | https://www.browserstack.com/careers | GREENHOUSE | `browserstack` | `ACTIVE_IMPORT` |
| 67 | Chargebee | https://www.chargebee.com/careers/ | GREENHOUSE | `chargebee` | `NEEDS_VERIFICATION` |
| 68 | Druva | https://www.druva.com/about/careers | GREENHOUSE | `druva` | `NEEDS_VERIFICATION` |
| 69 | Hasura | https://hasura.io/careers | LEVER | `hasura` | `NEEDS_VERIFICATION` |
| 70 | Juspay | https://juspay.io/careers | UNSUPPORTED | — | `LINK_ONLY` |
| 71 | Whatfix | https://whatfix.com/careers/ | GREENHOUSE | `whatfix` | `NEEDS_VERIFICATION` |
| 72 | ShareChat | https://sharechat.com/careers | GREENHOUSE | `sharechat` | `NEEDS_VERIFICATION` |
| 73 | Dream11 | https://www.dream11.com/careers | GREENHOUSE | `dream11` | `NEEDS_VERIFICATION` |
| 74 | Navi | https://navi.com/careers | UNSUPPORTED | — | `LINK_ONLY` |
| 75 | Ather Energy | https://www.atherenergy.com/careers | UNSUPPORTED | — | `LINK_ONLY` |

---

### Category 4: Engineering, Hardware, Analytics & Finance Technology (76–100)

| # | Company Name | Official Careers URL | Source Type | Board Identifier | Status |
|---|--------------|----------------------|-------------|------------------|--------|
| 76 | Siemens | https://jobs.siemens.com/ | UNSUPPORTED | — | `LINK_ONLY` |
| 77 | Bosch | https://www.bosch.in/careers/ | UNSUPPORTED | — | `LINK_ONLY` |
| 78 | Schneider Electric | https://www.se.com/in/en/about-us/careers/ | UNSUPPORTED | — | `LINK_ONLY` |
| 79 | Honeywell | https://careers.honeywell.com/ | UNSUPPORTED | — | `LINK_ONLY` |
| 80 | GE Vernova | https://careers.gevernova.com/ | UNSUPPORTED | — | `LINK_ONLY` |
| 81 | ABB | https://global.abb/group/en/careers | UNSUPPORTED | — | `LINK_ONLY` |
| 82 | Ericsson | https://www.ericsson.com/en/careers | UNSUPPORTED | — | `LINK_ONLY` |
| 83 | Nokia | https://www.nokia.com/about-us/careers/ | UNSUPPORTED | — | `LINK_ONLY` |
| 84 | Samsung | https://www.samsung.com/in/about-us/careers/ | UNSUPPORTED | — | `LINK_ONLY` |
| 85 | Sony | https://www.sonyjobs.com/ | UNSUPPORTED | — | `LINK_ONLY` |
| 86 | MediaTek | https://www.mediatek.com/careers | UNSUPPORTED | — | `LINK_ONLY` |
| 87 | Synopsys | https://www.synopsys.com/careers.html | UNSUPPORTED | — | `LINK_ONLY` |
| 88 | Cadence | https://www.cadence.com/en_US/home/company/careers.html | UNSUPPORTED | — | `LINK_ONLY` |
| 89 | Arm | https://careers.arm.com/ | UNSUPPORTED | — | `LINK_ONLY` |
| 90 | Micron Technology | https://careers.micron.com/ | UNSUPPORTED | — | `LINK_ONLY` |
| 91 | ZS | https://www.zs.com/careers | UNSUPPORTED | — | `LINK_ONLY` |
| 92 | Fractal Analytics | https://fractal.ai/careers/ | GREENHOUSE | `fractalanalytics` | `NEEDS_VERIFICATION` |
| 93 | Tiger Analytics | https://www.tigeranalytics.com/careers/ | UNSUPPORTED | — | `LINK_ONLY` |
| 94 | Mu Sigma | https://www.mu-sigma.com/careers/ | UNSUPPORTED | — | `LINK_ONLY` |
| 95 | Wells Fargo | https://www.wellsfargojobs.com/ | UNSUPPORTED | — | `LINK_ONLY` |
| 96 | JPMorganChase | https://careers.jpmorgan.com/ | UNSUPPORTED | — | `LINK_ONLY` |
| 97 | Goldman Sachs | https://www.goldmansachs.com/careers | UNSUPPORTED | — | `LINK_ONLY` |
| 98 | Morgan Stanley | https://www.morganstanley.com/people-opportunities | UNSUPPORTED | — | `LINK_ONLY` |
| 99 | American Express | https://aexp.eightfold.ai/careers | UNSUPPORTED | — | `LINK_ONLY` |
| 100 | Visa | https://corporate.visa.com/en/careers.html | UNSUPPORTED | — | `LINK_ONLY` |
