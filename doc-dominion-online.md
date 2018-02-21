# ToDo

* パフォーマンス
  * firebaseへ送るデータを文字列化などで圧縮
  * gameState Observableを分割して部分監視するように
* 山札・捨て札のサイズが0になっている
* プレイヤー募集画面のキャンセルのdisable
* 設定画面
    * カードサイズ調整
* forEachを使って検索するときにbreakできるように Array.some を使って utils のメソッドを書き直す
* move -> state transition
* カードの圧縮表示

## check

* buttonizeを発行しているところでそれ以外は非ボタンのときunbuttonize others を発行するように
* initializeDone と合成している observable で発火されないとまずいときはあるか

## memo

* 今の設計だとsnapshotは古い状態で複数手順の操作は書かねばならない
    （たとえばdrawCards(N)はdrawCard(1) x N で書けない）
* 命令列の同期による実装はうまく動く．問題は何を操作とみなすか
  * ボタン操作の入力列＋必要な場合は付加情報のみ (Observable<UserInput[]>)
    * ボタン操作に対応する命令列はリプレイに有用
    * 入力列から現在の形式の命令列へ変換する関数を作れば今の設計を転用できる
    * 入力列を受け取った後をローカルにできるので，gameSnapshot object を直接更新する書き方ができ，
        古いsnapshotで頑張らなくてもよくなる．
  * カード操作命令は完全に同期
* async function の利用をやめたことで直列な処理を別々に書く必要が生まれる
  * しかしゲーム状態をデータと一対一対応させる方針なので，
      async function のどの await まで処理を進めたかという状態を持つのは困る．

* GameStateService
  * GameStateShortcutService
    * GameLoopService

* フェーズの自動遷移は難しい
  * Action --> BuyPlay
    * アクションが0になっても法貨などがあると回復できるので自動遷移条件にできない．
    * 手札のアクションカードが0になったときがあっても，
      DrawCards の直前に一瞬だけ0になるときは除かねばならない．
  * BuyPlay --> BuyCard
    * 一度サプライをクリックして購入を開始したら遷移すればよい
    * BuyPlayフェーズでは財宝カードのプレイにより手札の財宝カードが0から1以上に回復することは今のところないので
        自動遷移は可能（Rocksが怪しいがBuyPhaseは銀貨は山札に獲得なので問題ない）

* Object.assign( dest, src ) でオブジェクトのコピー
* obs1.buffer(obs2) で ob1 の出力を obs2 が発火するタイミングまで溜めて配列で出力ができる
    * idleTime を作って

## 設計方針

* すべてのゲーム状態をデータと一対一対応させる
* 命令列の発行さえ正しくできればよい

## 定義

* ゲーム状態とはゲームの状態を表す情報すべてを過不足なく含むデータとする。
  * 各プレイヤーの名前と対応するインデックスは外部で定義するとし，
      ゲーム状態はプレイヤーはインデックスで表されるとする

## 処理の流れ

* プレイヤー募集開始時にGameRoomクラスを作成 (add-game-group.component)
  * ゲーム初期状態はこのときに生成される
  * プレイヤーが全員揃ったら game-main.component へ画面遷移・ゲーム開始
* ゲーム中は操作列とチャットのみが同期される
* game-state.service
  * ゲームの状態と状態遷移を担う．
* game-room-communication.service
  * firebaseとのやりとりとそのイベントに対するgame-state.serviceのメソッド呼び出しを担う．
* game-main.component
  * クリック操作に応じて

## GameRoomクラス

* データ
  * 手動入力（add-game-group.componentで設定）
    * プレイヤー数 (numberOfPlayers)
    * 使用する拡張セット (isSelectedExpansions)
    * メモ (memo)
  * 自動入力（add-game-group.service等で設定）
    * databaseKey
    * communicationId
    * 日付 (date)
    * 参加順をシャッフルするshuffle配列（プレイヤー順序の決定に使う）
    * プレイヤー（後から追加） (playersName)
      * 自分の名前は自動入力
      * 複数人が同時に参加する可能性があるのでfiredatabaseのlistのpushメソッドで
          -> playersNameは配列ではなくオブジェクトに
    * selectedCards
    * ゲーム初期状態
      * selectedCards
      * BlackMarketPileShuffled
* メソッド
  * 初期状態の生成（カードの初期化） (initCards)
  * プレイヤーのデッキ・手札の生成 (initDecks)

## GameCard

* 一枚のカードは以下の情報を持つ
  * その名前（「銅貨」など）
  * ID
  * 表裏の情報
  * クリックできる要素かどうかの情報
* 位置はそのコンテナにより表される．
* GameRoomクラス内のinitCardsではIDと名前のみ同期すればよい．
    -> が，ソースコードの統一のためにGameState型に

## データフロー

* 構成要素
  * View : game-main.component とその子要素すべて
  * game-state.service (以下Stat） :
      ゲームの状態管理を行う．状態遷移を行う基本操作を含む．
  * game-room-communication.service （以下Comm） :
      firebase との通信を担う．ゲーム状態遷移命令列とチャットメッセージの同期．
* 関係
  * View <--> Stat
    * View --> Stat : ボタン操作を Stat で解釈
    * View <-- Stat : Stat からゲーム状態を受け取り表示
  * Stat <--> Comm
    * Stat --> Comm : 状態遷移の命令発行メソッドを呼び出し
    * Stat <-- Comm : 状態遷移命令を解釈し状態遷移メソッドを呼び出し
  * Comm <--> {fire-database}
    * 状態遷移命令列を同期

## GameStateクラス

* turnCounter
* turnInfo: { phase, action, buy, coin }
* allPlayersData: { VPtoken }{}
* DCards
  * allPlayersCards
  * BasicCards
  * KingdomCards
  * trashPile
  * BlackMarketPile

## game-state.service

* 状態遷移命令
  * 基本操作
    * 'increment turnCounter'
    * @turnInfo
      * 'set phase',  {value}
      * 'set action', {value}
      * 'set buy',    {value}
      * 'set coin',   {value}
    * @allPlayersData
      * 'set VPtoken of player' {value} {playerId}
    * @DCards
      * 'face up cards for players'     {cardId array} {playerId array}
      * 'face down cards for players'   {cardId array} {playerId array}
      * 'buttonize cards for players'   {cardId array} {playerId array}
      * 'unbuttonize cards for players' {cardId array} {playerId array}
      * 'move cards to'                 {cardId array} {dest}
    * attack
  * ショートカット
    * @DCards
      * 'face up cards for all players'     {cardId array}
      * 'face down cards for all players'   {cardId array}
      * 'buttonize cards for all players'   {cardId array}
      * 'unbuttonize cards for all players' {cardId array}
      * 'reveal'    {cardId array}
      * 'trash'     {cardId array}
      * 'discard'   {cardId array}
      * 'play'      {cardId array}
      * 'gain'      {cardId array}
      * 'gain to'   {cardId array} {dest}
      * 'set aside' {cardId array}
* 補助メソッド
  * getCardById

## 2018/2/19

* gameStateのみは手続き的に書くことに．
  * viewと対応させてあるgameStateObsはasyncで処理しているアニメーションでも更新する必要があるため，
    これを宣言的に書くのはかえってややこしい．
  * userInputSeqenceから宣言的に定義することもできるが，
    そもそもその内部処理はコマンドの処理をすることになりあまり大差が無い
  * userInputSeqenceではなくuserInput一つごとに前のgameStateと合わせて次のgameStateを作る設計が自然だが，
    状態遷移は前の状態遷移の完了を待つ必要があるためsubscribeをPromiseの完了まで待機させる必要があり厄介．
