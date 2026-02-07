# Security Policy 🔒

## Architecture & Data Privacy

OmniTool is architected as a **100% Client-Side Application**. 

*   **No Data Ingestion:** We do not operate a backend server that processes user files.
*   **Local Processing:** All file manipulations (PDF generation, Image resizing, etc.) occur within the user's browser memory (WebAssembly/JS).
*   **Zero Egress:** User files are never transmitted over the network by our application code.

## Supported Versions

| Version | Supported |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

While we do not host user data, security vulnerabilities may still exist in:
1.  Cross-Site Scripting (XSS) vectors.
2.  Dependency vulnerabilities supply chain attacks.
3.  Service Worker caching strategies.

If you discover a security vulnerability, please **DO NOT** open a public issue.

### Disclosure Process

1.  Email the maintainers directly at `security@omnitool.example` (Replace with actual email).
2.  Include a description of the vulnerability and steps to reproduce.
3.  We will acknowledge your report within 48 hours.
4.  We will provide a timeline for the fix.

## Security for Contributors

*   Do not introduce external dependencies that require server-side API calls.
*   Ensure all new dependencies are audited for known vulnerabilities (`npm audit`).
*   Do not commit API keys or secrets (though this project should require none).

Thank you for helping keep OmniTool secure!
