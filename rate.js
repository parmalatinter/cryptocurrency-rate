var e = React.createElement;
const ENABLE_FILTER_NAME = "PRICE_FILTER";
const COIN_NAME = "1INCHUSDT";

class RowView extends React.Component {
    constructor(props) {
        super(props);
        this.state ={
            isLoaded: false,
            error: null,
            rows: []
        }
    }

    componentDidMount() {
        var instance = this;
        // for api get
        $.ajax({
            url: 'file:///C:/Users/Administrator/Desktop/test/klines.json',
            // url: 'https://api.binance.com/api/v3/ticker/price?symbol=1INCHUSDT',
            // url: 'https://api.binance.com/api/v3/klines?symbol=1INCHUSDT&interval=1d',
            dataType: 'json',
            cache: false,
            success: function(result) {
                this.setState({
                    isLoaded: true,
                    rows: result
                });
            }.bind(this),
            error: function(xhr, status, error) {
                this.setState({
                    isLoaded: true,
                    error: error
                });
            }.bind(this)
        });
    }

    render() {
        if (this.state.error) {
            return e('div', null, `${this.state.error.message}`);
        }
        else if ( !this.state.isLoaded ) {
            return e('div', null, `Loading...`);
        }
        else {
            return this.state.rows.map( row => {
                var index = 1;
                var date = new Date(row[0]*1000);
                var dateString = date.toLocaleDateString('ja-JP');
                return  e('tr', { id : index++, key : index}, [
                    e('td', { key : dateString + index}, `${dateString}`),
                    e('td', { key : row[1] + index + 'Open'}, `,${row[1]}`),
                    e('td', { key : row[2] + index + 'High'}, `,${row[2]}`),
                    e('td', { key : row[3] + index + 'Low'}, `,${row[3]}`),
                    e('td', { key : row[4] + index + 'Close'}, `,${row[4]}`)
                ]);
            });
        }
    }
}

ReactDOM.render(
    e(RowView, null),
    document.getElementById('root')
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
