FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml poetry.lock ./
RUN pip install --no-cache-dir "django>=6.0.2,<7.0.0" "uvicorn[standard]>=0.30.0,<1.0.0"

COPY scripts/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY . .

RUN adduser --disabled-password --gecos "" appuser \
    && chown -R appuser:appuser /app

USER appuser

ENTRYPOINT ["/entrypoint.sh"]
CMD ["uvicorn", "core.asgi:application", "--host", "0.0.0.0", "--port", "8000"]
