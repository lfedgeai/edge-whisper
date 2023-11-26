在线访问地址：https://edge-ai.yomo.run/

## Local Development

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

后端服务在 `http://1.13.101.86:8000`，设置了 `localhost:3000` 的跨域支持。

## Deploy

### Web is deployed on Vercel

`main` 分支自动部署到 `https://edge-ai.yomo.run` 

### AI backend

这里比较麻烦，思路是这样的：

1. 在线演示地址 `https://edge-ai.yomo.run` 是 `https` 的，这意味着浏览器要求该页面使用的所有资源都必须是 `https` 的，所以必须设置 API 以 `https` 形式接受请求。
2. 如果要给全球用户提供可访问性，国内腾讯云并不稳定，所以外面套一层 Cloudflare，做 Proxy，这样即解决了 `https` 和 `证书` 问题，也解决了全球访问的问题。
3. API 部署在腾讯云南京的 Nvidia T4 机器上，ip 是 `1.13.101.86`, 但这台机器的 firewall 开启了 `80` 端口后，依然不能访问，依稀记得腾讯云需要写备案等问题，小坚哥提交了工单，但不想等审核了。
4. 找了一台海外的机器，ip 是 `43.131.246.78`，开通 80 端口宿主一个 web 服务做测试使用。
5. 然后在 cloudflare 上设置 `ai.yomo.gq` 的 DNS 解析到该 ip ，并设置 `Proxy Status` 为开启状态，解决了 Step 2 的目的。
6. 此时访问 `https://ai.yomo.gq` 是 OK 的，请求链路是 `web browser ---> https://ai.yomo.gq:443 ----> Cloudflare ----> http://43.131.246.78:80`，那么只需要将 `43.131.246.78:80` 的请求转发到 `1.13.101.86:8000`，并能将相应结果再转发回来即可。
7. 在 `43.131.246.78` 的服务器上做如下设置：
  - 让 OS 支持 ip 转发功能：
    - `sudo vim /etc/sysctl.conf` 设置 `net.ipv4.ip_forward=1`
    - 执行 `sudo sysctl -p` 使配置生效
  - 将对 `80` 端口的请求，转发给 `1.13.101.86:8000`
    - `sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j DNAT --to-destination 1.13.101.86:8000`
  - 将 http response 转发回 cloudflare
    - `sudo iptables -t nat -A POSTROUTING -p tcp -d 1.13.101.86 --dport 8000 -j MASQUERADE`
8. 此时访问 `https://ai.yomo.gq` 是 OK 的，请求链路是 `web browser ---> https://ai.yomo.gq:443 ----> Cloudflare ----> http://43.131.246.78:80 ----> http:1.13.101.86:8000`
9. Done

最终的 iptables 的设置：

```sh
$ sudo iptables -t nat -L -n
Chain PREROUTING (policy ACCEPT)
target     prot opt source               destination
DNAT       tcp  --  0.0.0.0/0            0.0.0.0/0            tcp dpt:80 to:1.13.101.86:8000

Chain INPUT (policy ACCEPT)
target     prot opt source               destination

Chain OUTPUT (policy ACCEPT)
target     prot opt source               destination

Chain POSTROUTING (policy ACCEPT)
target     prot opt source               destination
MASQUERADE  tcp  --  0.0.0.0/0            1.13.101.86          tcp dpt:8000
```
