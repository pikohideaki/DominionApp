
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
    * game-state.service (
        以下Stat） : ゲームの状態管理を行う．状態遷移を行う基本操作を含む．
    * game-room-communication.service （以下Comm） : firebase との通信を担う．ゲーム状態遷移命令列とチャットメッセージの同期．
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
        * 
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
    * 

