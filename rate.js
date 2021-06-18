var e = React.createElement;
const ENABLE_FILTER_NAME = "PRICE_FILTER";
const COIN_NAME = "1INCHUSDT";
// const ExCHANGE_PARE_INDEX = 20; //usd/jpy
let globalState = {
    fxRow : null,
    cryptRows : null,
    csvData : null,
    amount : 0,
    coinName : null
};

// inputs : amount, pair
class Inputs extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            amount : 0,
            coinName: COIN_NAME
        };
        globalState.coinName = COIN_NAME;

        // This binding is necessary to make `this` work in the callback
        this.handleChangeAmount = this.handleChangeAmount.bind(this);
        this.handleChangePair = this.handleChangePair.bind(this);
    }

    handleChangeAmount(event) {
        // render rates
        let amount = parseFloat(event.target.value)
        this.setState({amount: amount});
        globalState.amount = amount;
    }

    handleChangePair(event) {
        // render rates
        this.setState({coinName: event.target.value});
        globalState.coinName = event.target.value;
    }

    render() {
        return [
            e('label', { key : 'label1', htmlFor : 'amount' }, `Amount：`),
            e('input', { key : 'input1', type : 'number', onChange : this.handleChangeAmount, value: this.state.value, name: 'amount'}),
            e('label', { key : 'label2', htmlFor : 'pair' }, `Pair：`),
            e('input', { key : 'input2', type : 'text', onChange : this.handleChangePair, value: this.state.coinName, name: 'pair'})
        ];
    }
}

// button : Search
class Button extends React.Component {
    constructor(props) {
        super(props);

        // This binding is necessary to make `this` work in the callback
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        // render rates
        ReactDOM.render(
            e(RowView, null),
            document.getElementById('root3')
        );
    }

    render() {
        return [
            e('button', { key : 'button', onClick : this.handleClick}, `Search`),
            e('br', { key : 'br' })
        ];
    }
}

// CSV Load
class CsvInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {file: null, csvData:null};
        globalState.csvData = null;

        // This binding is necessary to make `this` work in the callback
        this.handleChange = this.handleChange.bind(this);
    }

    convertRow(data){
        let result = [];
        data.filter(row =>{
            let index = parseInt(row.index);
            if(Number.isInteger(index)){
                result.push({
                    index : index,
                    buy : parseFloat(row.buy),
                    sell : parseFloat(row.sell),
                    mining : parseFloat(row.mining),
                    date : new Date(parseInt(row.date)).toLocaleDateString('ja-JP')
                });
            }
        });
        return result;
    }

    getCSV (file) {
        return new Promise(resolve =>{
            let buf;
            Papa.parse(file, {
                header: true,
                delimiter:',',

                complete:(buf) =>{
                    console.log(buf.data);
                    this.state = {file: file, csvData:buf.data};
                    globalState.csvData = this.convertRow(buf.data);
                    console.log(globalState)

                    ReactDOM.render(
                        e(Button, { key : 'button' }),
                        document.getElementById('root2')
                    );
                },
            });
        });
    }

    handleChange(event) {
        // render rates
        this.getCSV(event.target.files[0]);
    }

    render() {
        return [
            e('label', { key : 'label', htmlFor : 'csv'}, `csv：`),
            e('input', { key : 'input', type : 'file', onChange : this.handleChange, filename: this.state.value, name: 'csv'})
        ];
    }
}

// RowView : table
class RowView extends React.Component {
    constructor(props) {
        super(props);
        this.state ={
            isLoadedFx : false,
            isLoadedCrypto: false,
            error: null,
            cryptRows: [],
            fxRow: [],
            rows: []
        }
    }

    convertCryptRateRows(data){
        let result = {};
        data.filter(row =>{
            let dateString = new Date(parseInt(row[0])).toLocaleDateString('ja-JP');
            result[dateString] = {
                'date' : dateString,
                'open' : parseFloat(row[1]),
                'high' : parseFloat(row[2]),
                'low' : parseFloat(row[3]),
                'close' : parseFloat(row[4])
            }
        });
        return result;
    }

    getCryptRate(){
        // for api get
        $.ajax({
            url: 'file:///C:/Users/Administrator/Desktop/test/klines.json?test=' + globalState.coinName,
            // url: 'https://api.binance.com/api/v3/ticker/price?symbol=1INCHUSDT',
            // url: 'https://api.binance.com/api/v3/klines?symbol=1INCHUSDT&interval=1d',
            dataType: 'json',
            cache: false,
            success: (result => {
                let rows = this.convertCryptRateRows(result);
                this.setState({
                    isLoadedCrypto: true,
                    rows: rows,
                    cryptRows: rows,
                });
                globalState.cryptRows = rows;
            }).bind(this),
            error: ((xhr, status, error) => {
                this.setState({
                    isLoadedCrypto: true,
                    error: error
                });
            }).bind(this)
        });
    }

    convertFxRateRow(data){
        let result = [];

        data.filter(row =>{
            let dateString = new Date(parseInt(row.date)).toLocaleDateString('ja-JP');
            result[dateString] = {
                high : parseFloat(row.high),
                low : parseFloat(row.low),
                average : (parseFloat(row.high) + parseFloat(row.low)) / 2,
                date : dateString
            };
        });
        return result;
    }

    getFxRate(){
        // for api get
        $.ajax({
            url: 'file:///C:/Users/Administrator/Desktop/test/fx-rate.json',
            // url: 'https://www.gaitameonline.com/rateaj/getrate',
            dataType: 'json',
            cache: false,
            success: (result => {
                let row = this.convertFxRateRow(result.quotes);
                this.setState({
                    isLoadedFx: true,
                    fxRow: row
                });
                globalState.fxRow = row;
            }).bind(this),
            error: ((xhr, status, error) => {
                this.setState({
                    isLoadedFx: true,
                    error: error
                });
            }).bind(this)
        });
    }

    componentDidMount() {
        this.getCryptRate();
        this.getFxRate();
        console.log(globalState)
    }

    renderBaseTable(){
        return  e('table', { key : 'resultTable'}, [
            e('thead', { key : 'thead'}, [
                e('tr', { key : 'tr'}, [
                    e('th', { key : 'th_Index'}, 'Index'),
                    e('th', { key : 'th_Date'}, 'Date'),
                    e('th', { key : 'th_Rate'}, 'Rate'),
                    e('th', { key : 'th_Buy'}, 'Buy'),
                    e('th', { key : 'th_Sell'}, 'Sell'),
                    e('th', { key : 'th_Fee'}, 'Fee'),
                    e('th', { key : 'th_Mining'}, 'Mining'),
                ])
            ]),
            e('tbody', { key : 'tbody'}, [
                this.renderRows()
            ])
        ]);
    }

    renderRows(){
        let index = 1;
        return globalState.csvData.map( row => {
            index++;
            let key = row.date;
            let cryptRow = this.state.cryptRows[key];
            let currencyRate  = this.state.fxRow[key].average;
            return  e('tr', { id : row.index + 'tr', key : row.index + 'tr'}, [
                e('td', { key : row.index + 'index'}, `${row.index}`),
                e('td', { key : row.index + 'date'}, `${row.date}`),
                e('td', { key : row.index + 'rate'}, `${cryptRow.open}\$ \\${cryptRow.open * currencyRate}`),
                e('td', { key : row.index + 'buy'}, `\tStock : ${row.buy}\t (\\${row.buy * currencyRate * cryptRow.open})`),
                e('td', { key : row.index + 'sell'}, `\tStock : ${row.sell}\t (\\${row.sell * currencyRate * cryptRow.open})`),
                e('td', { key : row.index + 'fee'}, `\t${row.fee}%\t (\\${row.fee * currencyRate * cryptRow.open * (row.buy + row.sell)})`),
                e('td', { key : row.index + 'mining'}, `\tStock : ${row.mining}\t (\\${row.mining * currencyRate * cryptRow.open})`),
            ]);
        });
    }

    render() {
        if (this.state.error) {
            return e('div', { key : 'error'}, `${this.state.error.message}`);
        }
        if ( !this.state.isLoadedCrypto || !this.state.isLoadedFx ) {
            return e('div', { key : 'loading'}, `Loading...`);
        }

        return e('p', { key : 'title'}, [
            globalState.coinName,
            this.renderBaseTable()
        ]);

    }
}

ReactDOM.render(
    [
        e(CsvInput, { key : 'csvInput'}),
        e(Inputs, { key : 'inputs'})
    ],
    document.getElementById('root1')
);

// [
//     [
//         1499040000000,      // Open time
//         "0.01634790",       // Open
//         "0.80000000",       // High
//         "0.01575800",       // Low
//         "0.01577100",       // Close
//         "148976.11427815",  // Volume
//         1499644799999,      // Close time
//         "2434.19055334",    // Quote asset volume
//         308,                // Number of trades
//         "1756.87402397",    // Taker buy base asset volume
//         "28.46694368",      // Taker buy quote asset volume
//         "17928899.62484339" // Ignore
//     ]
// ]
