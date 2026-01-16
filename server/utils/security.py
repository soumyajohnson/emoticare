from cryptography.fernet import Fernet
import base64
import os

class DataEncryptor:
    def __init__(self, master_key):
        """
        master_key: A URL-safe base64-encoded 32-byte key.
        """
        if not master_key:
            raise ValueError("Master Encryption Key is required")
        self.master_fernet = Fernet(master_key)

    def encrypt(self, plaintext: str):
        """
        Envelope encryption:
        1. Generate a new Data Key (DK).
        2. Encrypt plaintext with DK.
        3. Encrypt DK with Master Key (MK).
        Returns: (encrypted_content_b64, encrypted_key_b64)
        """
        if not plaintext:
            return None, None

        # 1. Generate Data Key
        data_key = Fernet.generate_key()
        data_fernet = Fernet(data_key)

        # 2. Encrypt Content
        encrypted_content = data_fernet.encrypt(plaintext.encode('utf-8'))

        # 3. Encrypt Data Key
        encrypted_key = self.master_fernet.encrypt(data_key)

        return (
            base64.urlsafe_b64encode(encrypted_content).decode('utf-8'),
            base64.urlsafe_b64encode(encrypted_key).decode('utf-8')
        )

    def decrypt(self, encrypted_content_b64, encrypted_key_b64):
        """
        Decrypts envelope encrypted data.
        """
        if not encrypted_content_b64 or not encrypted_key_b64:
            return None

        try:
            # 1. Decode inputs
            encrypted_content = base64.urlsafe_b64decode(encrypted_content_b64)
            encrypted_key = base64.urlsafe_b64decode(encrypted_key_b64)

            # 2. Decrypt Data Key using Master Key
            data_key = self.master_fernet.decrypt(encrypted_key)
            data_fernet = Fernet(data_key)

            # 3. Decrypt Content
            plaintext = data_fernet.decrypt(encrypted_content)
            return plaintext.decode('utf-8')
        except Exception as e:
            # Log error securely (avoid logging data)
            print(f"Decryption failed: {str(e)}")
            return "[Decryption Failed]"
