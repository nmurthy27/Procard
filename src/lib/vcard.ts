/**
 * Generates and downloads a vCard file for the given profile
 */
export function downloadVCard(profile: {
  name: string;
  title?: string;
  company?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
}) {
  const vCard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${profile.name}`,
    profile.title ? `TITLE:${profile.title}` : '',
    profile.company ? `ORG:${profile.company}` : '',
    profile.email ? `EMAIL;TYPE=INTERNET:${profile.email}` : '',
    profile.phone ? `TEL;TYPE=CELL:${profile.phone}` : '',
    profile.linkedin ? `URL;TYPE=Linkedin:https://${profile.linkedin.replace(/^https?:\/\//, '')}` : '',
    'END:VCARD'
  ].filter(line => line !== '').join('\n');

  const blob = new Blob([vCard], { type: 'text/vcard' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${profile.name.replace(/\s+/g, '_')}.vcf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
