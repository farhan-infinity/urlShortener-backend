
## Title

Financelligence

## Prerequisites

Docker installed on your local machine.

## Installation

1. Clone this repository to your local machine:

```bash
git clone https://github.com/your-username/your-repo.git
```

2. Navigate to the project directory:

```bash
cd your-repo
```

3. Install the required dependencies:

```bash
npm install
```

4. Create a src> common> envs> .env file in the root directory and configure the following environment variables:

```bash
PORT=3001
BASE_URL=

# Postgre Database
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5432
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DATABASE=
MODE=DEV
RUN_MIGRATIONS=true

# JWT Configuration
TOKEN_SECRET=

# AWS Configuration
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_STORAGE_BUCKET_NAME=

```

## Usage

### Postgres
```bash
$ docker-compose up
```

### Nest App
```bash
$ docker build -t your-image-name .
$ docker run -d --name your-container-name -p 3001:3001 your-image-name
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
