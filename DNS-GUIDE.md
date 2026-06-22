# DNS Configuration Guide for BurnerSOL

## Domain: burnersol.com

### SPF Record (Email Authentication)
Add a TXT record to your DNS configuration:

```
TXT Record
Host: @
Value: v=spf1 include:spf.sendgrid.net ~all
TTL: 3600
```

Or if using other email providers:
```
v=spf1 include:_spf.google.com include:spf.protection.outlook.com ~all
```

### DMARC Record (Optional but recommended)
```
TXT Record
Host: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@burnersol.com; pct=100
TTL: 3600
```

### DKIM Record (if using SendGrid)
```
TXT Record
Host: smtp._domainkey
Value: k=rsa; p=your DKIM public key here
TTL: 3600
```

---

## Verification Commands

Check SPF:
```bash
nslookup -type=TXT burnersol.com
```

Check DMARC:
```bash
nslookup -type=TXT _dmarc.burnersol.com
```

---

## Notes
- SPF limits which servers can send email "from" your domain
- DMARC tells receivers what to do with emails that fail SPF/DKIM
- Allow up to 48 hours for DNS changes to propagate
- After adding SPF, test with: https://mxtoolbox.com/spf.aspx