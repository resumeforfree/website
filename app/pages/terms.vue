<script lang="ts" setup>
useHead({
    title: 'Terms and Conditions - Free Resume Builder',
    meta: [
        {
            name: 'description',
            content: 'Terms and conditions for using the Free Resume Builder application.',
        },
    ],
});
</script>

<template>
    <div class="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
        <div class="max-w-4xl mx-auto">
            <div class="text-center mb-12">
                <h1 class="text-4xl font-bold text-gray-900 mb-4">
                    Terms and Conditions
                </h1>
                <p class="text-lg text-gray-600">
                    Last updated: {{ new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}
                </p>
            </div>

            <div class="prose prose-lg max-w-none">
                <h2>1. Acceptance of Terms</h2>
                <p>
                    By accessing and using the Free Resume Builder ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>

                <h2>2. Open Source Nature</h2>
                <p>
                    This project is open source and available on GitHub. The source code is freely available for review, modification, and contribution under the applicable open source license. The project is under ongoing development, with regular updates and improvements being made.
                </p>

                <h2>3. Development Status and Support</h2>
                <p>
                    This application is actively under development. While the developer strives to maintain high quality and fix any issues as quickly as possible, please understand that:
                </p>
                <ul>
                    <li>New features and improvements are continuously being added</li>
                    <li>Bugs and issues may occasionally occur during the development process</li>
                    <li>The developer makes best efforts to resolve problems promptly</li>
                    <li>Updates and maintenance are performed regularly to ensure optimal performance</li>
                </ul>

                <h2>4. Limitation of Liability</h2>
                <p>
                    <strong>IMPORTANT DISCLAIMER:</strong> While the developer makes every effort to maintain the service and protect user data, you acknowledge and agree that:
                </p>
                <ul>
                    <li>Any technical issues, service interruptions, or data loss that may occur are not the liability of the developer</li>
                    <li>The service is provided "as is" without warranties of any kind, either express or implied</li>
                    <li>Users are responsible for maintaining their own backups of important resume data</li>
                    <li>The developer shall not be liable for any direct, indirect, incidental, special, or consequential damages</li>
                </ul>

                <h2>5. Privacy and Data</h2>
                <p>
                    Your privacy is important to us. The application is designed with privacy in mind:
                </p>
                <ul>
                    <li>Resume data can be stored locally on your device</li>
                    <li>Cloud sync is optional and requires user registration</li>
                    <li>We do not sell or share your personal information with third parties</li>
                    <li>Data transmission is secured using industry-standard encryption</li>
                </ul>

                <h2>6. User Responsibilities</h2>
                <p>
                    As a user of this service, you agree to:
                </p>
                <ul>
                    <li>Use the service for legitimate resume building purposes only</li>
                    <li>Not attempt to compromise the security or functionality of the service</li>
                    <li>Maintain the confidentiality of your account credentials if using cloud sync</li>
                    <li>Report any bugs or issues you encounter to help improve the service</li>
                </ul>

                <h2>7. Service Availability</h2>
                <p>
                    While we strive to maintain continuous service availability, we cannot guarantee 100% uptime. The service may occasionally be unavailable due to:
                </p>
                <ul>
                    <li>Scheduled maintenance and updates</li>
                    <li>Infrastructure or hosting issues</li>
                    <li>Unexpected technical problems</li>
                </ul>

                <h2>8. Changes to Terms</h2>
                <p>
                    These terms may be updated from time to time to reflect changes in the service or legal requirements. Users will be notified of significant changes, and continued use of the service constitutes acceptance of the updated terms.
                </p>

                <h2>9. Contact Information</h2>
                <p>
                    If you have any questions about these Terms and Conditions, please contact us through the contact page or GitHub repository.
                </p>

                <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
                    <h3 class="text-lg font-semibold text-blue-900 mb-2">
                        Open Source Community
                    </h3>
                    <p class="text-blue-800">
                        This project welcomes contributions from the community. If you're interested in contributing, reporting issues, or suggesting improvements, please visit our GitHub repository. Together, we can make this tool better for everyone.
                    </p>
                </div>
            </div>

            <div class="text-center mt-12">
                <NuxtLink to="/">
                    <Button size="lg">
                        Back to Home
                    </Button>
                </NuxtLink>
            </div>
        </div>
    </div>
</template>
