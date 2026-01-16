from __future__ import annotations

import re
from typing import Optional, Tuple

from google.cloud import storage

from app.settings import settings


_GS_RE = re.compile(r"^gs://([^/]+)/(.+)$")


def _parse_gs(uri: str) -> Tuple[str, str]:
    m = _GS_RE.match(uri)
    if not m:
        raise ValueError(f"Invalid gs:// uri: {uri}")
    return m.group(1), m.group(2)


def gcs_download_bytes(uri: str) -> bytes:
    bucket_name, blob_name = _parse_gs(uri)
    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(blob_name)
    return blob.download_as_bytes()


def maybe_upload_bytes(data: bytes, blob_path: str, content_type: str) -> Optional[str]:
    """Upload to gs://<GCS_BUCKET>/<blob_path> if configured."""
    if not settings.gcs_bucket:
        return None
    client = storage.Client()
    bucket = client.bucket(settings.gcs_bucket)
    blob = bucket.blob(blob_path)
    blob.upload_from_string(data, content_type=content_type)
    return f"gs://{settings.gcs_bucket}/{blob_path}"
