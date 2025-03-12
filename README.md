# Daily Polls Discord Bot

Sends the same poll in a channel over and over again. Made for uni friends to determine if/where we're going to eat.

## Build

1. Create and populate a `.env` file in the root directory with the content of `example.env`.
2. Run the following command in the root directory:

```bash
docker compose up --build
```

## Usage

> You can add random times to the poll! Just replace a number with rand(min-max) in the `polls.csv` file.
