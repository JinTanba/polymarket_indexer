import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
import { ApolloQueryResult } from '@apollo/client/core'
const INTERVAL = 2000

// ApolloClientインスタンス
const client = new ApolloClient({
  uri: 'https://api.goldsky.com/api/public/project_cl6mb8i9h0003e201j6li0diw/subgraphs/activity-subgraph/0.0.4/gn',
  cache: new InMemoryCache(),
})

// for GPT: ここにクエリを足す感じでお願い
const QUERY = gql`
  query getSplitsAndMerges {
    splits(first: 100, orderBy: timestamp, orderDirection: desc) {
      id
      timestamp
      stakeholder
      condition
      amount
    }
    merges(first: 100, orderBy: timestamp, orderDirection: desc) {
      id
      timestamp
      stakeholder
      condition
      amount
    }
  }
`

let local = 0

function watchSplitsAndMergesWithPolling(): void {

  //INTERVALミリ秒ごとにイベントを確認して、キャッシュと見比べて、新鮮なデータがあったら検出する
  const observable = client.watchQuery({
    query: QUERY,
    pollInterval: INTERVAL, 
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  })

  observable.subscribe({
    next: (result: ApolloQueryResult<any>) => {
      const splitsData = result.data?.splits ?? []
      const mergesData = result.data?.merges ?? []

      console.log(`==== Polling count: ${local} ====`)
      console.log('Latest Split:', splitsData[0] || 'No splits')
      console.log('Latest Merge:', mergesData[0] || 'No merges')
      //splitsを検知して、mergesを検知しなかったときは、mergesはから配列になる
      //reserve_gcp();
      local += 1
    },
    error: (error) => {
      console.error('Error while polling splits/merges:', error)
    },
  })
}

// エントリーポイント
async function main() {
  watchSplitsAndMergesWithPolling()
}

main()
