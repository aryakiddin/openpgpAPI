const express = require('express');
const openpgp = require('openpgp');

const app = express();
app.use(express.json());

//generate keys
const generateKeyPair = async () => {
    const { publicKey, privateKey } = await openpgp.generateKey({
        curve: 'ed25519',
        userIDs: [
            {
                name: 'Akshay Mane', email: 'Akshay@example.com',
            }
        ],
        passphrase: 'secret secret secret ',
    });

     console.log(publicKey);
     console.log(privateKey);

    return { publicKey, privateKey  };
}

generateKeyPair();

const publicKeyArmored = `-----BEGIN PGP PUBLIC KEY BLOCK-----

xjMEZB8E9xYJKwYBBAHaRw8BAQdA12hVPvIIn9/2Zt5AAuB4R14pSUt27lkc
9SNLktpp5aPNIEFrc2hheSBNYW5lIDxBa3NoYXlAZXhhbXBsZS5jb20+wowE
EBYKAD4FgmQfBPcECwkHCAmQEb/f6os2uykDFQgKBBYAAgECGQECmwMCHgEW
IQS4EY1wVN3xM3aTjQMRv9/qiza7KQAAcN0BAN3YQ48fcH0sQ3J2fXKuFjHt
tOmnI/DO8y/Q6VfjrQPuAQCdDyUPSLsDcwrWZrWyTPDab/gh9s8aGvHYDNPQ
56jgDs44BGQfBPcSCisGAQQBl1UBBQEBB0BK15J1aobUQDZjWHeK9Vxo+ach
ThoB0GE3HwZeRqX4ZAMBCAfCeAQYFggAKgWCZB8E9wmQEb/f6os2uykCmwwW
IQS4EY1wVN3xM3aTjQMRv9/qiza7KQAAsoMA/3GR0VcFVmmvif4sxsYCvGk+
K8yad7VpVT9H6MO9rtwuAQCzy4IriSfNUlxjSGh5mndj9qWYZ8C0eU9xgMmC
uPtYAQ==
=kQnL
-----END PGP PUBLIC KEY BLOCK-----`

const privateKeyArmored = `-----BEGIN PGP PRIVATE KEY BLOCK-----

xYYEZB8E9xYJKwYBBAHaRw8BAQdA12hVPvIIn9/2Zt5AAuB4R14pSUt27lkc
9SNLktpp5aP+CQMIJ5FAA6PfD23gQ28AaFD7tH3B5NJqExT8nUD/ocIN6BEW
qjQJusKBD75cdOC0Fu5Kvj59XFPuvBb9yvIKJQRVTRjm9LbI5RkGaTpEam3o
780gQWtzaGF5IE1hbmUgPEFrc2hheUBleGFtcGxlLmNvbT7CjAQQFgoAPgWC
ZB8E9wQLCQcICZARv9/qiza7KQMVCAoEFgACAQIZAQKbAwIeARYhBLgRjXBU
3fEzdpONAxG/3+qLNrspAABw3QEA3dhDjx9wfSxDcnZ9cq4WMe206acj8M7z
L9DpV+OtA+4BAJ0PJQ9IuwNzCtZmtbJM8Npv+CH2zxoa8dgM09DnqOAOx4sE
ZB8E9xIKKwYBBAGXVQEFAQEHQErXknVqhtRANmNYd4r1XGj5pyFOGgHQYTcf
Bl5GpfhkAwEIB/4JAwh+LH5kPsaSROBd24SxBSS302ijx0SFfaku7DWHZ++F
rhwODld6Pxk9vmqRSdeNEJl2x0sjKbEqhw+DU3jIohL49Dl5Jkm0w/pAV2jJ
vt2SwngEGBYIACoFgmQfBPcJkBG/3+qLNrspApsMFiEEuBGNcFTd8TN2k40D
Eb/f6os2uykAALKDAP9xkdFXBVZpr4n+LMbGArxpPivMmne1aVU/R+jDva7c
LgEAs8uCK4knzVJcY0hoeZp3Y/almGfAtHlPcYDJgrj7WAE=
=t1BD
-----END PGP PRIVATE KEY BLOCK-----`



// Encrypt sensitive data with the public key
const encryptData = async (data) => {
    const publicKey = await openpgp.readKey({ armoredKey: publicKeyArmored });
    const encryptedData = await openpgp.encrypt({
      message: await openpgp.createMessage({ text: JSON.stringify(data) }),
      encryptionKeys: publicKey
    });
    return encryptedData;
  };
  
  
  // Endpoint for encrypting data with the public key
  app.post('/encrypt', async (req, res) => {
    try {
      const encryptedData = await encryptData(req.body);
      res.json({ data: encryptedData });
    } catch (error) {
      res.status(500).json({ error: 'Failed to encrypt data' });
    }
  });
  
  // Endpoint for decrypting data with the private key
  
  app.post('/decrypt', async (req, res) => {
    const encryptedData = req.body;
  
    const decryptedData = await openpgp.decrypt({
      message: await openpgp.message.readArmored(encryptedData),
      publicKeys: (await openpgp.key.readArmored(publicKeyArmored)).keys,
      privateKeys: (await openpgp.key.readArmored(privateKeyArmored)).keys,
      passphrase: 'secret secret secret ',
    });
  
    const data = JSON.parse(decryptedData.data);
    res.send(data);
});

  // Start the server
  app.listen(3000, () => {
    console.log('Server running on port 3000');
  });