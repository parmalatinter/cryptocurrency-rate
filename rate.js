var e = React.createElement;
const ENABLE_FILTER_NAME = "PRICE_FILTER";
const COIN_NAME = "1INCHUSDT";
// const ExCHANGE_PARE_INDEX = 20; //usd/jpy
var glovalState = {
    fxRow : null,
    cryptRows : null,
    csvData : null,
    coinName : null
};

// search
class Input extends React.Component {
    constructor(props) {
        super(props);
        this.state = {value: COIN_NAME};
        glovalState.coinName = COIN_NAME;

        // This binding is necessary to make `this` work in the callback
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange() {
        // render rates
        this.setState({value: event.target.value});
        glovalState.coinName = event.target.value;
    }

    render() {
        return [
            e('label', { htmlFor : 'pair'}, `Pair：`),
            e('input', { type : 'text', onChange : this.handleChange, value: this.state.value, name: 'pair'})
        ];
    }
}

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
            e('button', { onClick : this.handleClick}, `Search`),
            e('br', null)
        ];
    }
}

// CSV Load
class CsvInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {file: null, csvData:null};
        glovalState.csvData = null;

        // This binding is necessary to make `this` work in the callback
        this.handleChange = this.handleChange.bind(this);
    }

    convertRow(data){
        let result = [];
        data.filter(row =>{
            row.index = parseInt(row.index);
            if(Number.isInteger(row.index)){
                row.buy = parseFloat(row.buy)
                row.sell = parseFloat(row.sell)
                row.mining = parseFloat(row.mining)
                row.date = new Date(parseInt(row.date)).toLocaleDateString('ja-JP');
                result.push(row);
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
                    glovalState.csvData = this.convertRow(buf.data);
                    console.log(glovalState)

                    ReactDOM.render(
                        e(Button, null),
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
            e('label', { htmlFor : 'csv'}, `csv：`),
            e('input', { type : 'file', onChange : this.handleChange, filename: this.state.value, name: 'csv'})
        ];
    }
}

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
            let convertedRow = {
                'date' : dateString,
                'open' : parseFloat(row[1]),
                'high' : parseFloat(row[2]),
                'low' : parseFloat(row[3]),
                'close' : parseFloat(row[4])
            }
            result[dateString] = convertedRow;
        });
        return result;
    }

    getCryptRate(){
        // for api get
        $.ajax({
            url: 'file:///C:/Users/Administrator/Desktop/test/klines.json?test=' + glovalState.coinName,
            // url: 'https://api.binance.com/api/v3/ticker/price?symbol=1INCHUSDT',
            // url: 'https://api.binance.com/api/v3/klines?symbol=1INCHUSDT&interval=1d',
            dataType: 'json',
            cache: false,
            success: function(result) {
                let rows = this.convertCryptRateRows(result);
                this.setState({
                    isLoadedCrypto: true,
                    rows: rows,
                    cryptRows: rows,
                });
                glovalState.cryptRows = rows;
            }.bind(this),
            error: function(xhr, status, error) {
                this.setState({
                    isLoadedCrypto: true,
                    error: error
                });
            }.bind(this)
        });
    }

    convertFxRateRow(data){
        let result = [];

        data.filter(row =>{
            let dateString = new Date(parseInt(row.date)).toLocaleDateString('ja-JP');
            row.high = parseFloat(row.high)
            row.low = parseFloat(row.low)
            row.avarage = (row.high + row.low) / 2
            row.date = dateString;
            result[dateString] = row;
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
            success: function(result) {
                let row = this.convertFxRateRow(result.quotes);
                this.setState({
                    isLoadedFx: true,
                    fxRow: row
                });
                glovalState.fxRow = row;
            }.bind(this),
            error: function(xhr, status, error) {
                this.setState({
                    isLoadedFx: true,
                    error: error
                });
            }.bind(this)
        });
    }

    componentDidMount() {
        this.getCryptRate();
        this.getFxRate();
        console.log(glovalState)
    }

    render() {
        if (this.state.error) {
            return e('div', null, `${this.state.error.message}`);
        }
        if ( !this.state.isLoadedCrypto || !this.state.isLoadedFx ) {
            return e('div', null, `Loading...`);
        }

        return glovalState.csvData.map( row => {
            let key = row.date;
            let index = 1;
            let cryptRow = this.state.cryptRows[key];
            let rate  = this.state.fxRow[key].bid;
            return  e('tr', { id : row.index, key : index}, [
                e('td', { key : row.index + 'index'}, `${row.index}`),
                e('td', { key : row.index + 'date'}, `${row.date}`),
                e('td', { key : row.index + 'buy'}, `\tStock : ${row.buy}\t (\\${row.buy * rate * cryptRow.open})`),
                e('td', { key : row.index + 'sell'}, `\tStock : ${row.sell}\t (\\${row.sell * rate * cryptRow.open})`),
                e('td', { key : row.index + 'mining'}, `\tStock : ${row.mining}\t (\\${row.mining * rate * cryptRow.open})`),
            ]);
        });

    }
}

ReactDOM.render(
    [
        e(CsvInput, null),
        e(Input, null)
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
