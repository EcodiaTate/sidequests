// TODO: All legal document content below is placeholder text and requires full legal review
// before production use. Engage qualified legal counsel for each jurisdiction.

interface LegalSection {
  heading: string;
  body: string;
}

interface LegalDocument {
  title: string;
  lastUpdated: string;
  sections: LegalSection[];
}

export const LEGAL_SLUGS = [
  "terms",
  "privacy",
  "cookies",
  "dpa",
  "community-standards",
  "security",
  "responsible-disclosure",
  "subprocessors",
  "market",
  "safety",
] as const;

export type LegalSlug = (typeof LEGAL_SLUGS)[number];

export const LEGAL_DOCUMENTS: Record<LegalSlug, LegalDocument> = {
  terms: {
    title: "Terms of Use",
    lastUpdated: "2026-02-24",
    sections: [
      {
        heading: "Introduction",
        body: "Welcome to ecodia. These Terms of Use govern your access to and use of the ecodia platform, including our website, mobile applications, and all related services. By creating an account or using ecodia, you agree to be bound by these terms in their entirety.",
      },
      {
        heading: "Eligibility",
        body: "You must be at least 13 years of age to create an ecodia account, or the minimum age required by the laws of your country if that age is higher. Users under 18 must have consent from a parent or legal guardian. We reserve the right to request proof of age or parental consent at any time.",
      },
      {
        heading: "Account Registration",
        body: "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate, current, and complete information during registration and to update such information as necessary. ecodia reserves the right to suspend or terminate accounts that contain inaccurate or misleading information.",
      },
      {
        heading: "Acceptable Use",
        body: "You agree to use ecodia only for lawful purposes and in accordance with these terms. You must not use the platform to harass, abuse, or harm other users, or to distribute spam, malware, or any content that violates applicable laws. Violations of this policy may result in immediate account suspension or termination.",
      },
      {
        heading: "Intellectual Property",
        body: "All content, trademarks, and intellectual property displayed on ecodia are owned by or licensed to ecodia Pty Ltd. User-generated content remains the property of the respective creators, but by posting content on ecodia you grant us a non-exclusive, worldwide, royalty-free licence to use, display, and distribute that content within the platform. You must not reproduce, modify, or distribute any ecodia proprietary materials without prior written consent.",
      },
      {
        heading: "ECO Virtual Currency",
        body: "ECO is a virtual currency used within the ecodia platform and holds no real-world monetary value. ECO cannot be exchanged for legal tender, and balances are non-transferable outside the platform except where explicitly permitted. ecodia reserves the right to modify the earning rates, redemption values, and availability of ECO at any time with reasonable notice.",
      },
      {
        heading: "Limitation of Liability",
        body: "To the maximum extent permitted by applicable law, ecodia and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform. Our total liability for any claim related to the service shall not exceed the amount you paid to ecodia in the twelve months preceding the claim. Nothing in these terms excludes or limits liability that cannot be excluded under applicable law, including Australian Consumer Law.",
      },
      {
        heading: "Termination",
        body: "We may suspend or terminate your access to ecodia at any time for violation of these terms, with or without notice depending on the severity of the breach. You may delete your account at any time through your account settings. Upon termination, your right to use the platform ceases immediately, though certain provisions of these terms will survive termination.",
      },
      {
        heading: "Governing Law",
        body: "These terms are governed by the laws of the State of New South Wales, Australia, without regard to conflict of law principles. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts of New South Wales. If any provision of these terms is found to be unenforceable, the remaining provisions shall continue in full force and effect.",
      },
      {
        heading: "Changes to Terms",
        body: "ecodia reserves the right to modify these terms at any time. We will notify you of material changes via email or an in-app notification at least 30 days before the changes take effect. Your continued use of the platform after the effective date constitutes acceptance of the updated terms. If you do not agree to the revised terms, you must discontinue use of the platform.",
      },
    ],
  },

  privacy: {
    title: "Privacy Policy",
    lastUpdated: "2026-02-24",
    sections: [
      {
        heading: "Information We Collect",
        body: "We collect information you provide directly, such as your name, email address, date of birth, and profile details when you create an account. We also collect usage data automatically, including device information, IP addresses, and interaction logs. Where you participate in eco-actions or challenges, we may collect location data and photographic evidence with your explicit consent.",
      },
      {
        heading: "How We Use Your Information",
        body: "We use your personal information to provide and improve the ecodia platform, personalise your experience, and deliver relevant content and challenges. Your data helps us maintain platform safety, prevent fraud, and comply with legal obligations. We may also use aggregated, de-identified data for research and analytics purposes to understand environmental impact trends.",
      },
      {
        heading: "Data Sharing",
        body: "We do not sell your personal information to third parties. We may share data with trusted service providers who assist in operating the platform, subject to strict contractual confidentiality obligations. We may also disclose information where required by law, to protect the safety of our users, or in connection with a merger or acquisition.",
      },
      {
        heading: "Data Retention",
        body: "We retain your personal information for as long as your account is active or as needed to provide you with our services. After account deletion, we will remove or de-identify your personal data within 90 days, except where retention is required by law or for legitimate business purposes such as fraud prevention. Aggregated, non-identifying data may be retained indefinitely for analytics.",
      },
      {
        heading: "Your Rights",
        body: "You have the right to access, correct, or delete your personal information at any time through your account settings or by contacting us. Under applicable privacy legislation, including the Australian Privacy Act 1988, you may also request a copy of your data in a portable format. If you believe your privacy rights have been violated, you have the right to lodge a complaint with the relevant supervisory authority.",
      },
      {
        heading: "Children's Privacy",
        body: "ecodia is committed to protecting the privacy of young users. We do not knowingly collect personal information from children under 13 without verifiable parental consent. Parents and guardians can review, modify, or request deletion of their child's information by contacting our privacy team. We implement additional safeguards for users identified as minors, including restricted data collection and limited social features.",
      },
      {
        heading: "Cookies",
        body: "We use cookies and similar tracking technologies to enhance your experience, remember your preferences, and analyse platform usage. Essential cookies are required for the platform to function, while analytics and preference cookies are optional. You can manage your cookie preferences through your browser settings or our cookie consent tool; see our Cookies Policy for full details.",
      },
      {
        heading: "Security",
        body: "We implement industry-standard security measures to protect your personal information, including encryption in transit and at rest, access controls, and regular security audits. While we take reasonable precautions, no method of electronic storage or transmission is completely secure. We encourage you to use strong, unique passwords and enable two-factor authentication on your account.",
      },
      {
        heading: "International Transfers",
        body: "Your data is primarily stored and processed in Australia. Where we transfer data to service providers located outside Australia, we ensure appropriate safeguards are in place, including contractual protections that meet the requirements of the Australian Privacy Act. We assess each overseas recipient to ensure they provide a comparable level of data protection.",
      },
      {
        heading: "Contact Us",
        body: "If you have questions about this Privacy Policy or wish to exercise your privacy rights, you can contact our Privacy Officer at privacy@ecodia.app. We aim to respond to all privacy enquiries within 30 days. For complaints that remain unresolved, you may contact the Office of the Australian Information Commissioner (OAIC).",
      },
    ],
  },

  cookies: {
    title: "Cookies Policy",
    lastUpdated: "2026-02-24",
    sections: [
      {
        heading: "What Are Cookies",
        body: "Cookies are small text files stored on your device when you visit a website or use an application. They help websites remember your preferences and understand how you interact with the platform. ecodia uses both session cookies, which expire when you close your browser, and persistent cookies, which remain on your device until they expire or you delete them.",
      },
      {
        heading: "How We Use Cookies",
        body: "We use cookies to keep you signed in, remember your language and display preferences, and provide a secure browsing experience. Cookies also help us understand which features are most popular and how users navigate the platform, allowing us to continuously improve ecodia. We never use cookies to collect sensitive personal information without your explicit consent.",
      },
      {
        heading: "Types of Cookies",
        body: "Essential cookies are necessary for the platform to function and cannot be disabled. Performance cookies collect anonymous usage statistics to help us optimise the platform. Preference cookies remember your settings such as theme, language, and notification preferences across sessions.",
      },
      {
        heading: "Third-Party Cookies",
        body: "Some cookies on ecodia are set by third-party services we use for analytics and error tracking. These third parties process data in accordance with their own privacy policies, and we only work with providers who meet our data protection standards. We do not allow third-party advertising cookies on the ecodia platform.",
      },
      {
        heading: "Managing Cookies",
        body: "You can control and delete cookies through your browser settings at any time. Please note that disabling essential cookies may prevent certain features of ecodia from functioning correctly. You can also adjust your cookie preferences through the cookie consent banner displayed when you first visit ecodia, or through your account privacy settings.",
      },
      {
        heading: "Contact Us",
        body: "If you have questions about our use of cookies, please contact us at privacy@ecodia.app. We will respond to your enquiry within a reasonable timeframe. This Cookies Policy may be updated periodically to reflect changes in our practices or applicable regulations.",
      },
    ],
  },

  dpa: {
    title: "Data Processing Agreement",
    lastUpdated: "2026-02-24",
    sections: [
      {
        heading: "Definitions",
        body: "In this Data Processing Agreement (DPA), 'Controller' refers to the entity that determines the purposes and means of processing personal data, and 'Processor' refers to ecodia Pty Ltd, which processes data on behalf of the Controller. 'Personal Data', 'Processing', and 'Data Subject' have the meanings given in the Australian Privacy Act 1988 and, where applicable, the EU General Data Protection Regulation. This DPA forms part of the service agreement between ecodia and the Controller.",
      },
      {
        heading: "Scope and Purpose",
        body: "This DPA applies to all personal data processed by ecodia on behalf of the Controller in connection with the provision of the ecodia platform. Processing activities include storage, retrieval, analysis, and display of user data as described in the service agreement. ecodia will only process personal data in accordance with the Controller's documented instructions and applicable law.",
      },
      {
        heading: "Data Processing",
        body: "ecodia will process personal data solely for the purposes specified in this DPA and the service agreement. We will not process personal data for any other purpose without the prior written consent of the Controller. All processing will be carried out in accordance with applicable data protection legislation and the security measures described in this agreement.",
      },
      {
        heading: "Security Measures",
        body: "ecodia implements appropriate technical and organisational measures to ensure a level of security appropriate to the risk of processing. These measures include encryption of data in transit and at rest, role-based access controls, regular vulnerability assessments, and staff training on data protection. We regularly review and update our security measures to address evolving threats.",
      },
      {
        heading: "Sub-processors",
        body: "ecodia may engage sub-processors to assist with data processing, subject to the Controller's prior written consent. We maintain an up-to-date list of sub-processors, which is available in our Subprocessors List document. ecodia will ensure that each sub-processor is bound by data protection obligations no less protective than those set out in this DPA.",
      },
      {
        heading: "Data Subject Rights",
        body: "ecodia will assist the Controller in responding to requests from data subjects exercising their rights under applicable data protection law. We will promptly notify the Controller of any data subject requests received directly and will not respond to such requests without the Controller's authorisation, unless required by law. Technical and organisational measures are in place to facilitate the fulfilment of these requests.",
      },
      {
        heading: "Data Breach",
        body: "In the event of a personal data breach, ecodia will notify the Controller without undue delay and in any event within 72 hours of becoming aware of the breach. The notification will include a description of the nature of the breach, the categories and approximate number of affected data subjects, and the measures taken or proposed to address the breach. ecodia will cooperate fully with the Controller in investigating and remediating any breach.",
      },
      {
        heading: "Term and Termination",
        body: "This DPA remains in effect for the duration of the service agreement between ecodia and the Controller. Upon termination, ecodia will, at the Controller's election, return or securely delete all personal data within 90 days, unless retention is required by applicable law. Obligations relating to confidentiality and data protection survive termination of this agreement.",
      },
    ],
  },

  "community-standards": {
    title: "Community Standards",
    lastUpdated: "2026-02-24",
    sections: [
      {
        heading: "Our Values",
        body: "The ecodia community is built on respect, inclusivity, and a shared commitment to environmental sustainability. We believe that meaningful change happens when people collaborate, support one another, and celebrate diverse perspectives. Every member of our community plays a role in maintaining a positive, safe, and welcoming environment for all.",
      },
      {
        heading: "Expected Behavior",
        body: "We expect all community members to treat each other with kindness and respect in all interactions on the platform. Constructive feedback, honest communication, and good-faith participation in challenges and discussions are encouraged. Members should respect the intellectual property and privacy of others, and represent their eco-actions truthfully.",
      },
      {
        heading: "Prohibited Content",
        body: "Content that is hateful, discriminatory, sexually explicit, violent, or promotes self-harm is strictly prohibited. Spam, misleading claims about environmental impact, and fraudulent eco-action submissions undermine community trust and are not tolerated. Any content that violates applicable laws, including defamation, harassment, or incitement to violence, will be removed and may result in account action.",
      },
      {
        heading: "Reporting",
        body: "If you encounter content or behaviour that violates these Community Standards, please report it using the in-app reporting tools. Reports are reviewed by our Trust & Safety team, typically within 24 hours. All reports are treated confidentially, and we do not disclose the identity of reporters to the individuals being reported.",
      },
      {
        heading: "Enforcement",
        body: "Violations of these standards may result in content removal, temporary account suspension, or permanent ban depending on the severity and frequency of the offence. We apply enforcement actions consistently and proportionally, taking into account the context and intent behind the behaviour. Repeat offenders and those who commit serious violations may be permanently removed from the platform without prior warning.",
      },
      {
        heading: "Appeals",
        body: "If you believe an enforcement action was taken in error, you may submit an appeal through the in-app appeals process within 30 days of the action. Appeals are reviewed by a senior member of our Trust & Safety team who was not involved in the original decision. We aim to resolve all appeals within 14 business days and will notify you of the outcome via email.",
      },
    ],
  },

  security: {
    title: "Security Information",
    lastUpdated: "2026-02-24",
    sections: [
      {
        heading: "Our Commitment",
        body: "ecodia is committed to protecting the security and integrity of our platform and the data entrusted to us by our users. We maintain a comprehensive information security programme that is reviewed and updated regularly to address emerging threats. Our security practices are aligned with industry standards and relevant regulatory requirements.",
      },
      {
        heading: "Infrastructure",
        body: "The ecodia platform is hosted on enterprise-grade cloud infrastructure with built-in redundancy, automatic failover, and geographic distribution. All systems are monitored continuously for performance, availability, and security events. We conduct regular infrastructure audits and penetration testing to identify and remediate potential vulnerabilities.",
      },
      {
        heading: "Data Protection",
        body: "All data transmitted between your device and ecodia is encrypted using TLS 1.3. Data at rest is encrypted using AES-256 encryption, and encryption keys are managed through a dedicated key management service with strict access controls. Database backups are encrypted and stored in geographically separate locations to ensure data durability and disaster recovery capability.",
      },
      {
        heading: "Access Controls",
        body: "We implement the principle of least privilege across all systems, ensuring that personnel only have access to the data and systems necessary for their role. Multi-factor authentication is required for all staff accessing production systems. Access logs are maintained and reviewed regularly, and access is revoked promptly upon role change or departure.",
      },
      {
        heading: "Incident Response",
        body: "ecodia maintains a documented incident response plan that is tested and updated regularly. In the event of a security incident, our response team follows established procedures for containment, investigation, remediation, and communication. We are committed to transparent communication with affected users and relevant authorities in accordance with applicable breach notification laws.",
      },
      {
        heading: "Responsible Disclosure",
        body: "We welcome reports from security researchers who discover potential vulnerabilities in our platform. If you identify a security issue, please refer to our Responsible Disclosure Policy for guidelines on how to report it. We are committed to working collaboratively with the security community to keep ecodia safe for all users.",
      },
    ],
  },

  "responsible-disclosure": {
    title: "Responsible Disclosure Policy",
    lastUpdated: "2026-02-24",
    sections: [
      {
        heading: "Scope",
        body: "This policy applies to security vulnerabilities discovered in ecodia's web application, mobile applications, and public-facing APIs. Infrastructure and services operated by third-party providers are excluded from this scope unless the vulnerability directly affects ecodia user data. We encourage researchers to focus on issues that have a meaningful impact on the security or privacy of our users.",
      },
      {
        heading: "Reporting",
        body: "Please report security vulnerabilities to security@ecodia.app with a detailed description of the issue, steps to reproduce, and any supporting evidence such as screenshots or proof-of-concept code. Include your contact information so we can follow up with questions or updates. We aim to acknowledge all reports within 48 hours and provide an initial assessment within 5 business days.",
      },
      {
        heading: "What We Ask",
        body: "We ask that you do not access, modify, or delete data belonging to other users during your research. Please avoid automated scanning or testing that could degrade the performance or availability of our services. Give us reasonable time to investigate and address the vulnerability before disclosing it publicly, and coordinate any public disclosure with our security team.",
      },
      {
        heading: "What We Offer",
        body: "We will work with you in good faith to understand and resolve reported vulnerabilities as quickly as possible. Researchers who report valid, previously unknown vulnerabilities may be eligible for recognition on our security acknowledgements page. We are committed to keeping you informed of our progress in addressing the reported issue throughout the remediation process.",
      },
      {
        heading: "Exclusions",
        body: "The following are excluded from this policy: denial-of-service attacks, social engineering or phishing of ecodia staff or users, and physical security testing of ecodia offices or data centres. Reports of missing security headers, SSL configuration issues, or other low-severity informational findings without a demonstrated security impact are generally out of scope. We reserve the right to determine whether a reported issue qualifies under this policy.",
      },
      {
        heading: "Safe Harbor",
        body: "ecodia will not pursue legal action against security researchers who discover and report vulnerabilities in good faith and in compliance with this policy. We consider security research conducted under this policy to be authorised and will not initiate legal proceedings against you for circumventing technology controls in the course of your research. This safe harbour applies only to legal claims under our control and does not bind independent third parties.",
      },
    ],
  },

  subprocessors: {
    title: "Subprocessors List",
    lastUpdated: "2026-02-24",
    sections: [
      {
        heading: "Current Subprocessors",
        body: "ecodia engages the following subprocessors to deliver our services: cloud hosting and infrastructure providers for application hosting and data storage, analytics providers for aggregated usage insights, email delivery services for transactional and notification emails, and payment processors for subscription billing. Each subprocessor is bound by contractual data protection obligations consistent with this agreement and applicable privacy legislation. A detailed list of current subprocessors with their processing purposes and data locations is available upon request.",
      },
      {
        heading: "Changes to Subprocessors",
        body: "ecodia may add or replace subprocessors from time to time as our platform evolves. Before engaging a new subprocessor, we conduct a thorough assessment of their data protection practices and security measures. Any new subprocessor will be subject to contractual obligations no less protective than those described in our Data Processing Agreement.",
      },
      {
        heading: "Notification Process",
        body: "We will notify customers of any changes to our subprocessor list at least 30 days before the new subprocessor begins processing personal data. Notifications will be sent via email to the primary contact on your account and posted to this page. If you have a reasonable objection to a new subprocessor, you may contact us within the notification period to discuss your concerns and potential alternatives.",
      },
    ],
  },

  market: {
    title: "Market-Specific Information",
    lastUpdated: "2026-02-24",
    sections: [
      {
        heading: "Australian Users",
        body: "ecodia Pty Ltd is incorporated in Australia and operates under Australian law. Australian users are protected by the Australian Consumer Law, and nothing in our terms excludes, restricts, or modifies rights that cannot be excluded under the Competition and Consumer Act 2010 (Cth). Our handling of personal information complies with the Australian Privacy Principles set out in the Privacy Act 1988 (Cth).",
      },
      {
        heading: "Data Localisation",
        body: "Primary data for Australian users is stored within Australian data centre regions. Where data is processed or backed up in other jurisdictions, we ensure that appropriate safeguards are in place, including contractual protections and assessments of the recipient country's data protection framework. We are committed to transparency about where your data is stored and processed.",
      },
      {
        heading: "Regulatory Compliance",
        body: "ecodia monitors and adapts to evolving regulatory requirements across the jurisdictions in which we operate. We engage with industry bodies and regulatory authorities to ensure our platform meets applicable standards for data protection, consumer protection, and digital safety. Users can contact our compliance team at compliance@ecodia.app for questions about jurisdiction-specific regulatory matters.",
      },
    ],
  },

  safety: {
    title: "Safety Policy",
    lastUpdated: "2026-02-24",
    sections: [
      {
        heading: "User Safety",
        body: "The safety of our users is our highest priority. ecodia employs a combination of automated systems and human review to detect and address harmful content and behaviour on the platform. We work with external safety organisations and law enforcement where necessary to protect our community members from harm.",
      },
      {
        heading: "Age Requirements",
        body: "Users must be at least 13 years of age to use ecodia, or the minimum age required by local law if higher. We implement age-gating during registration and provide enhanced privacy protections and restricted social features for users identified as minors. Parents and guardians can manage their child's account through our family management tools, including the ability to review activity and adjust privacy settings.",
      },
      {
        heading: "Content Safety",
        body: "All user-generated content on ecodia is subject to our Community Standards and is monitored through automated content moderation systems. Content that depicts or promotes violence, self-harm, illegal activity, or exploitation is removed immediately upon detection. We continuously improve our moderation systems based on emerging trends and feedback from our Trust & Safety team.",
      },
      {
        heading: "Reporting Safety Concerns",
        body: "If you encounter content or behaviour that makes you feel unsafe, please use the in-app reporting feature available on all profiles, posts, and messages. For urgent safety concerns, including threats of imminent harm, please contact local emergency services immediately and then notify us at safety@ecodia.app. Our Trust & Safety team reviews urgent reports on a priority basis, including outside of business hours.",
      },
      {
        heading: "Emergency Contacts",
        body: "If you or someone you know is in immediate danger, please contact your local emergency services (000 in Australia, 911 in the United States, 112 in Europe). For mental health support, Australian users can contact Lifeline on 13 11 14 or Kids Helpline on 1800 55 1800. ecodia is not an emergency service and cannot provide real-time crisis intervention.",
      },
    ],
  },
};
