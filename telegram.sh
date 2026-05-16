# Proxy

## onexray
pomyanem

## MTProto
```sh
❯ openssl rand -hex 16

❯ sudo docker run -d \
              --name tg-ws-proxy \
              --restart=always \
              -p 443:1443 \
              -e TG_WS_PROXY_SECRET="XxX" \
              -e TG_WS_PROXY_DC_IPS="1:149.154.167.220 2:149.154.167.220 3:149.154.167.220 4:149.154.167.220 5:149.154.167.220" \
              tg-ws-proxy:latest
```sh


## sock5
```sh
❯ paru -S byedpi-bin
❯ ciadpi --disorder 1 --auto=torst
❯ ~/Projects/tg-ws-proxy tags/v1.3.0~2*
❯ git checkout bd4746004efa8553c67de2af59d9dee288221e6e
❯ uv run --no-project --with cryptography python proxy/tg_ws_proxy.py --host 0.0.0.0 --port 1443
```
