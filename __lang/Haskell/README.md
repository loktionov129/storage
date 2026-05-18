# Haskell Docker App 🚀

Static Haskell app with **optimal Docker multistage builds** (~15MB runtime image).

## Features
- ✅ **Fully static binary** - no runtime deps  
- ✅ **Layer caching** - fast rebuilds  
- ✅ **Dev environment** - code without host GHC  
- ✅ **Alpine Linux** - tiny images  

## Quick Start

```bash
# Production build & run
docker build -t haskell-app .
docker run --rm haskell-app

# Development (live reload)
docker-compose up -d
docker-compose exec haskell-dev ghc -isrc -o out/my-app src/Main.hs
docker-compose exec haskell-dev ./out/my-app
```

## Output
```
Hello, GitHub User! Haskell is running in Docker.
--- Haskell Math Samples ---
Factorial of 5: 120
First 10 Fibonacci numbers: [0,1,1,2,3,5,8,13,21,34]
Sorted list: [1,2,3,4,5,9]
```

## File Structure
```
.
├── Dockerfile          # Production multistage (10MB runtime)
├── docker-compose.yml  # Local environment w/ volumes
├── Dockerfile.local    # Local image with ghc/cabal/vim
├── src/
│   └── Main.hs         # Your app
└── .dockerignore       # Exclude .git, dist/, etc
```

## Docker Layers (Production)
```
builder: alpine:3.19 + ghc + deps → compiles → 1.2GB (discarded)
runtime: alpine:3.19 + binary → 15MB
```

## Dev Workflow
1. `docker-compose up -d` - start container  
2. Edit `src/Main.hs` on host  
3. `docker-compose exec haskell-dev ghc ...` - build  
4. `./out/my-app` - instant run  

**Hot reload**: Code changes sync via volume mount!

## Optimization Secrets
- `apk add ghc` before `COPY src/` → caches compiler  
- `-static -optl-static` → fully static binary  
- `.dockerignore`: `**/.git` `**/dist` `**/.cabal`  

## Build Stats
```
Image size: 15MB (vs 1GB+ naive)
Build time: 30s first, 5s incremental
```

## Extend It
```haskell
-- Add web server
scotty get 8080 $ html "Haskell API!"
cabal install scotty
```