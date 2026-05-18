FROM alpine:3.19 AS builder
WORKDIR /app
# Install deps first for caching
RUN apk add --no-cache \
    ghc \
    cabal \
    g++ \
    musl-dev \
    zlib-dev \
    zlib-static
# Copy only project files AFTER deps (cache hit if code changes)
COPY src/ src/
RUN mkdir -p out && \
    ghc -isrc -static -optl-static \
       -o out/my-app src/Main.hs \
       -outputdir=out

###

FROM alpine:3.19 AS runtime
RUN apk add --no-cache zlib
WORKDIR /app
COPY --from=builder /app/out/my-app .
CMD ["./my-app"]