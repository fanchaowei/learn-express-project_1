# PostgreSQL 18 Docker Setup

## Quick Start

### Start PostgreSQL
```bash
cd docker
docker-compose up -d
```

### Stop PostgreSQL
```bash
docker-compose down
```

### Stop and remove volumes (⚠️ deletes all data)
```bash
docker-compose down -v
```

## Configuration

Edit `.env` file to customize:
- `POSTGRES_USER`: Database username (default: postgres)
- `POSTGRES_PASSWORD`: Database password (default: postgres123)
- `POSTGRES_DB`: Database name (default: myapp_db)
- `POSTGRES_PORT`: Host port mapping (default: 5432)

## Connection Details

**Host:** localhost
**Port:** 5432
**Database:** myapp_db
**Username:** postgres
**Password:** postgres123

### Connection String
```
postgresql://postgres:postgres123@localhost:5432/myapp_db
```

## Useful Commands

### View logs
```bash
docker-compose logs -f postgres
```

### Access PostgreSQL CLI
```bash
docker-compose exec postgres psql -U postgres -d myapp_db
```

### Check container status
```bash
docker-compose ps
```

### Restart container
```bash
docker-compose restart postgres
```

## Initialization Scripts

Place SQL scripts in `docker/init/` folder. They will run automatically on first startup.

Example:
```bash
mkdir init
echo "CREATE TABLE users (id SERIAL PRIMARY KEY, name VARCHAR(100));" > init/01-create-tables.sql
```

## Data Persistence

Database data is stored in Docker volume `postgres_data`. Data persists across container restarts.

## Health Check

The container includes a health check that verifies PostgreSQL is ready to accept connections.
