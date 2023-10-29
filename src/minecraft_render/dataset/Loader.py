from typing import Protocol, Self

from .types import IResourceLoader, ResourcePath


class ICreateMultiloader(Protocol):
    def __call__(self, *loaders: IResourceLoader) -> IResourceLoader:
        ...


class IMinecraftAssetsLoader(IResourceLoader, Protocol):
    @classmethod
    def fetchAll(cls, ref: str, version: str, /) -> Self:
        ...

    def buildURL(self, path: str, /) -> str:
        ...


class PythonResourceLoader(Protocol):
    def loadTexture(self, path: ResourcePath, /) -> str:
        """Returns a Base64-encoded string."""
        ...

    def loadJSON(self, path: ResourcePath, /) -> str:
        """Returns a JSON-encoded string."""
        ...


class IPythonLoaderWrapper(IResourceLoader, Protocol):
    def __init__(self, inner: PythonResourceLoader, /) -> None:
        ...
