CREATE TABLE payments (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount              bigint       NOT NULL CHECK (amount > 0),
  currency            char(3)      NOT NULL CHECK (currency IN ('RUB', 'USD', 'EUR')),
  status              varchar      NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'succeeded', 'failed')),
  idempotency_key     varchar      NOT NULL UNIQUE,
  provider_payment_id varchar      NOT NULL UNIQUE,
  created_at          timestamptz  NOT NULL DEFAULT now(),
  updated_at          timestamptz  NOT NULL DEFAULT now()
);

CREATE TABLE webhook_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    varchar      NOT NULL UNIQUE,
  payment_id  uuid         NOT NULL REFERENCES payments (id),
  status      varchar      NOT NULL,
  received_at timestamptz  NOT NULL DEFAULT now()
);
