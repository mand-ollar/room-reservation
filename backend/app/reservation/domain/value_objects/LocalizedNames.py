from pydantic import BaseModel


class LocalizedNames(BaseModel):
    ko: str
    en: str

    def to_dict(self) -> dict[str, str]:
        return {"ko": self.ko, "en": self.en}

    @classmethod
    def from_dict(cls, data: dict[str, str]) -> "LocalizedNames":
        return cls(ko=data["ko"], en=data["en"])
