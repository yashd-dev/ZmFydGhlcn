CREATE TABLE IF NOT EXISTS actuals (
    start_time timestamptz PRIMARY KEY,
    settlement_date date NOT NULL,
    settlement_period smallint NOT NULL,
    mw double precision NOT NULL,
    publish_time timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS forecasts (
    start_time timestamptz NOT NULL,
    publish_time timestamptz NOT NULL,
    mw double precision NOT NULL,
    PRIMARY KEY (start_time, publish_time)
);
