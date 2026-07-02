import hashlib
import secrets

SCRYPT_N: int = 2**14
SCRYPT_R: int = 8
SCRYPT_P: int = 1
KEY_LENGTH: int = 64
SALT_LENGTH: int = 16

MIN_ADMIN_PASSWORD_LENGTH: int = 8


def hash_password(password: str) -> str:
    salt: bytes = secrets.token_bytes(SALT_LENGTH)
    digest: bytes = hashlib.scrypt(
        password.encode("utf-8"),
        salt=salt,
        n=SCRYPT_N,
        r=SCRYPT_R,
        p=SCRYPT_P,
        dklen=KEY_LENGTH,
    )
    return f"scrypt${SCRYPT_N}${SCRYPT_R}${SCRYPT_P}${salt.hex()}${digest.hex()}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        algorithm, n_text, r_text, p_text, salt_hex, digest_hex = stored_hash.split("$", maxsplit=5)
    except ValueError:
        return False

    if algorithm != "scrypt":
        return False

    salt: bytes = bytes.fromhex(salt_hex)
    expected_digest: bytes = bytes.fromhex(digest_hex)
    computed_digest: bytes = hashlib.scrypt(
        password.encode("utf-8"),
        salt=salt,
        n=int(n_text),
        r=int(r_text),
        p=int(p_text),
        dklen=len(expected_digest),
    )
    return secrets.compare_digest(computed_digest, expected_digest)
