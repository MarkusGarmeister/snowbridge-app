"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AccountInfo, useBridgeStatus } from "@/hooks/useBridgeStatus"
import { useWindowHash } from "@/hooks/useWindowHash"
import { formatBalance, formatTime } from "@/lib/utils"
import { assetHubNativeTokenAtom, snowbridgeContextAtom, snowbridgeEnvironmentAtom } from "@/store/snowbridge"
import { useAtomValue } from "jotai"
import { LucideLoaderCircle } from "lucide-react"
import { FC, Suspense } from "react"

const AccountRow: FC<{ account: AccountInfo }> = ({ account }) => {
  let amount = "0"
  let symbol = "ETH"
  const assetHubNativeToken = useAtomValue(assetHubNativeTokenAtom)
  switch (account.type) {
    case "ethereum":
      symbol = "ETH"
      amount = formatBalance(account.balance, 18)
      break;
    case "substrate":
      symbol = assetHubNativeToken?.tokenSymbol ?? "DOT"
      amount = formatBalance(account.balance, assetHubNativeToken?.tokenDecimal ?? 10)
      break;
  }
  return (<TableRow >
    <TableCell>{account.name} <pre className="text-xs hidden md:block">{account.account}</pre></TableCell>
    <TableCell><pre className="text-xs">{amount} {symbol}</pre></TableCell>
  </TableRow>)
}

const StatusCard = () => {
  const snowbridgeEnv = useAtomValue(snowbridgeEnvironmentAtom)
  const context = useAtomValue(snowbridgeContextAtom)
  const { data: status, mutate } = useBridgeStatus(snowbridgeEnv, context)
  const hash = useWindowHash()
  const diagnostic = hash === 'diagnostic'

  if (status == null) return (<Loading />)

  const toPolkadotStyle = status.summary.toPolkadotOperatingMode === "Normal" ? "text-green-700" : "text-red-700"
  const toEthereumStyle = status.summary.toEthereumOperatingMode === "Normal" ? "text-green-700" : "text-red-700"
  const overallStyle = status.summary.overallStatus === "Normal" ? "text-green-700 font-semibold" : "text-red-700 font-semibold"
  if (status == null) return (<Loading />)

  return (
    <Card className="w-[360px] md:w-2/3">
      <CardHeader>
        <CardTitle>Bridge Status</CardTitle>
        <CardDescription className="hidden md:flex">The status of Snowbridge.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 justify-start pb-2">
          <h1 className="text-2xl font-semibold col-span-2 py-2">Summary</h1>
          <hr className="col-span-2 py-2" />
          <p>Overall:</p><p> <span className={overallStyle}>{status.summary.overallStatus}</span></p>
          <p>To Polkadot:</p><p> <span className={toPolkadotStyle}>{status.summary.toPolkadotOperatingMode} {formatTime(status.statusInfo.toPolkadot.latencySeconds)}</span></p>
          <p>To Ethereum:</p><p> <span className={toEthereumStyle}>{status.summary.toEthereumOperatingMode} {formatTime(status.statusInfo.toEthereum.latencySeconds)}</span></p>
        </div>

        <div className={diagnostic ? "" : "hidden"}>

          <div className="grid grid-cols-2 justify-between pb-2 px-2">
            <h1 className="text-2xl font-semibold col-span-2 py-2">Detail</h1>
            <hr className="col-span-2 py-2" />
            <h1 className="text-xl font-semibold col-span-2 py-2">To Polkadot</h1>
            <hr className="col-span-2 py-2" />
            <p className="px-2">Beacon Client</p><p className="px-2">{status.statusInfo.toPolkadot.operatingMode.beacon}</p>
            <p className="px-2">Inbound Messages</p><p className="px-2">{status.statusInfo.toPolkadot.operatingMode.inbound}</p>
            <p className="px-2">Outbound Messages</p><p className="px-2">{status.statusInfo.toPolkadot.operatingMode.outbound}</p>
            <p className="px-2">Latest Ethereum Block</p><p className="px-2">{status.statusInfo.toPolkadot.latestEthereumBlock}</p>
            <p className="px-2">Ethereum Block in Beacon client</p><p className="px-2">{status.statusInfo.toPolkadot.latestEthereumBlockOnPolkadot}</p>
            <p className="px-2">Beacon client Latency (blocks)</p><p className="px-2">{status.statusInfo.toPolkadot.blockLatency}</p>
            <h1 className="text-xl font-semibold col-span-2 py-2">To Ethereum</h1>
            <hr className="col-span-2 py-2" />
            <p className="px-2">Outbound Messages</p><p className="px-2">{status.statusInfo.toEthereum.operatingMode.outbound}</p>
            <p className="px-2">Latest Relaychain Block</p><p className="px-2">{status.statusInfo.toEthereum.latestPolkaotBlock}</p>
            <p className="px-2">Relaychain Block in BEEFY client</p><p className="px-2">{status.statusInfo.toEthereum.latestPolkadotBlockOnEthereum}</p>
            <p className="px-2">BEEFY client latency (blocks)</p><p className="px-2">{status.statusInfo.toEthereum.blockLatency}</p>
          </div>

          <div className="pb-2">
            <h1 className="text-2xl font-semibold col-span-4 py-2">Channels</h1>
            <hr className="col-span-3 py-2" />
            {status.channelStatusInfos.map((ci, i) => {
              return (<div className="grid grid-cols-4 justify-start py-2" key={i}>
                <h1 className="text-xl font-semibold py-2 col-span-4">{ci.name}</h1>
                <hr className="col-span-4 py-2" />
                <p className="col-span-2"></p><p className="px-2">Inbound</p><p className="px-2">Outbound</p>
                <p className="col-span-2 px-2">To Ethereum nonce</p><p className="px-2">{ci.status.toEthereum.inbound}</p><p className="px-2">{ci.status.toEthereum.outbound}</p>
                <p className="col-span-2 px-2">To Polkadot nonce</p><p className="px-2">{ci.status.toPolkadot.inbound}</p><p className="px-2">{ci.status.toPolkadot.outbound}</p>
                <p className="col-span-2 px-2">To Polkadot Operating Mode</p><p className="col-span-2">{ci.status.toPolkadot.operatingMode.outbound}</p>
              </div>)
            })}
          </div>
          <div className="flex-col pb-2">
            <h1 className="text-2xl font-semibold py-2">Relayers</h1>
            <hr className="py-2" />
            <Table >
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead>Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {status.relayers.map((acc, i) => <AccountRow key={i} account={acc} />)}
              </TableBody>
            </Table>
          </div>

          <div className="flex-col">
            <h1 className="text-2xl font-semibold py-2">Accounts</h1>
            <hr className="py-2" />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead>Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {status.accounts.map((acc, i) => <AccountRow key={i} account={acc} />)}
              </TableBody>
            </Table>
          </div>
        </div>
        <br />
        <Button onClick={() => mutate()}>Refresh</Button>
      </CardContent>
    </Card>
  )
}

const Loading = () => {
  return (<div className="flex text-primary underline-offset-4 hover:underline text-sm items-center"><LucideLoaderCircle className="animate-spin mx-1 text-secondary-foreground" /></div>)
}

export default function Status() {
  return (
    <Suspense fallback={<Loading />}>
      <StatusCard />
    </Suspense>)
}