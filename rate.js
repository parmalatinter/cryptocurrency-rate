var e = React.createElement;
const ENABLE_FILTER_NAME = "PRICE_FILTER";
const COIN_NAME = "1INCHUSDT";
// const ExCHANGE_PARE_INDEX = 20; //usd/jpy
var glovalState = {
    fxRow : null,
    cryptRows : null,
    rows : null
};

// search
class Input extends React.Component {
    constructor(props) {
        super(props);
        this.state = {value: COIN_NAME};
        glovalState['value'] = COIN_NAME;

        // This binding is necessary to make `this` work in the callback
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange() {
        // render rates
        this.setState({value: event.target.value});
        glovalState['value'] = event.target.value;
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
        // this.state = {isToggleOn: true};

        // This binding is necessary to make `this` work in the callback
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        // render rates
        ReactDOM.render(
            e(RowView, null),
            document.getElementById('root2')
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
        glovalState['csvData'] = null;

        // This binding is necessary to make `this` work in the callback
        this.handleChange = this.handleChange.bind(this);
    }

    convertRow(data){
        var result = [];
        data.filter(row =>{
            row.index = parseInt(row.index);
            if(Number.isInteger(row.index)){
                row.buy = parseFloat(row.buy)
                row.sell = parseFloat(row.sell)
                row.date = new Date(parseInt(row.date)).toLocaleDateString('ja-JP');
                result.push(row);
            }
        });
        return result;
    }

    getCSV (file) {
        return new Promise(resolve =>{
            var buf;
            Papa.parse(file, {
                header: true,
                delimiter:',',

                complete:(buf) =>{
                    console.log(buf.data);
                    this.state = {file: file, csvData:buf.data};
                    glovalState['csvData'] = this.convertRow(buf.data);
                    console.log(glovalState)
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

class CsvButton extends React.Component {
    constructor(props) {
        super(props);
        // this.state = {isToggleOn: true};

        // This binding is necessary to make `this` work in the callback
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        // render rates
    }

    render() {
        return e('button', { onClick : this.handleClick}, `Set`);
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

    getCryptoRate(){
        // for api get
        $.ajax({
            url: 'file:///C:/Users/Administrator/Desktop/test/klines.json?test=' + glovalState['value'],
            // url: 'https://api.binance.com/api/v3/ticker/price?symbol=1INCHUSDT',
            // url: 'https://api.binance.com/api/v3/klines?symbol=1INCHUSDT&interval=1d',
            dataType: 'json',
            cache: false,
            success: function(result) {
                this.setState({
                    isLoadedCrypto: true,
                    rows: result,
                    cryptRows: result,
                });
                glovalState.cryptRows = this.state.cryptRows;
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
        var result = [];
        data.filter(row =>{
            row.high = parseFloat(row.high)
            row.low = parseFloat(row.low)
            row.avarage = (row.high + row.low) / 2
            row.date = new Date(parseInt(row.date)).toLocaleDateString('ja-JP');
            result.push(row);
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
                this.setState({
                    isLoadedFx: true,
                    fxRow: this.convertFxRateRow(result.quotes)
                });
                glovalState.fxRow = this.state.fxRow;
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
        this.getCryptoRate();
        this.getFxRate();
        console.log(glovalState)
    }

    render() {
        if (this.state.error) {
            return e('div', null, `${this.state.error.message}`);
        }
        else if ( !this.state.isLoadedCrypto && !this.state.isLoadedFx ) {
            return e('div', null, `Loading...`);
        }
        else {
            return this.state.cryptRows.map( cryptRow => {
                var index = 1;
                var date = new Date(cryptRow[0]);
                var dateString = date.toLocaleDateString('ja-JP');
                return  e('tr', { id : index++, key : index}, [
                    e('td', { key : dateString + index}, `${dateString}`),
                    e('td', { key : cryptRow[1] + index + 'Open'}, `\t${cryptRow[1]}`),
                    e('td', { key : cryptRow[2] + index + 'High'}, `\t${cryptRow[2]}`),
                    e('td', { key : cryptRow[3] + index + 'Low'}, `\t${cryptRow[3]}`),
                    e('td', { key : cryptRow[4] + index + 'Close'}, `\t${cryptRow[4]}`)
                ]);
            });
        }
    }
}

ReactDOM.render(
    [
        e(Input, null), e(Button, null),
        e(CsvInput, null), e(CsvButton, null)
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
