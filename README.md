# dsh-gateway-wallet

DeepSeek Harness 侧边栏左下角的「站点余额」：点开后显示**当前路由**在站点账本上的剩余额度和今日实扣，覆盖国内中转（Sub2API / New API）和 DeepSeek 官方，不是本地 token × 单价的估算。

和 [TokenLedger](https://github.com/zh667/TokenLedger)（用量账本）是互补关系：用量账本记的是本机会话里的 token；本插件读的是站点给这把 key 的余额。

显示内容（站点有返回才出现对应行）：

- 当前路由、令牌名、脱敏 Key（`sk-••••xxxx`）；配了多条路由时可切换查看
- 余额、今日实扣、累计已用
- 今日 / 累计 token 桶与请求数
- 套餐名、RPM / TPM
- 余额低于 $1 / ¥5 时，侧边栏按钮打点（侧栏收起时仍能看见）

完整 API Key 只在本机 Host 进程里用作 `Authorization` 头，不会进入浏览器，也不会发到本插件作者的任何服务器。

## 截图

侧边栏入口，金额跟随当前选中的账户：

![侧边栏入口](assets/sidebar.png)

点开后的站点账本（上半：账户与金额）：

![面板上半](assets/panel-top.png)

同一面板下滑（下半：用量、速率、读取来源）：

![面板下半](assets/panel-bottom.png)

## 安装

需要 DeepSeek Harness 的 `web` profile。

```sh
dsh plugin --profile web add github:MuAllen/dsh-gateway-wallet
```

重启已经在跑的 DSH，浏览器硬刷新。侧边栏底部会出现「站点余额」。

升级或卸载：

```sh
dsh plugin --profile web update dsh-gateway-wallet
dsh plugin --profile web remove dsh-gateway-wallet
```

## 支持的账本

| 站点程序 | 接口 | 说明 |
| --- | --- | --- |
| Sub2API（如部分国内中转） | `GET /v1/usage` | 余额、今日/累计实扣、token 桶 |
| New API / One API 等分支 | `GET /api/usage/token/` | 额度、已用；今日仅日志完整返回时显示。key 额度不限时余额显示为未公布，令牌栏单独标明这把 key 不限 |
| DeepSeek 官方 | `GET /user/balance` | 仅 `api.deepseek.com`：余额；没有今日实扣 |

只使用你已经配给这条路由的普通 API key。打开账本前会用不带密钥的 404/401 探测认出是 Sub2API 还是 New API；对不上的站点会说明原因，**不会按另一套程序换算额度**。

## 免责声明

- 本插件是独立的第三方社区项目，与 DeepSeek、各中转站均无隶属、赞助或背书关系。「DeepSeek」及相关商标归其权利人所有。
- 面板上的金额以站点当时返回为准，不是对账单或税务凭证。接口变更、站点口径或网络失败都可能导致空白或与控制台不一致。
- 本软件按 MIT 许可证「按现状」提供，作者不对使用本插件造成的损失承担责任。

侧边栏按钮的交互参考了 TokenLedger 的 `sidebar.footer.action` 用法。

## License

[MIT](LICENSE)
