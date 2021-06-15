var e = React.createElement;
const COIN_NAME = "1INCHUSDT";

var glovalState = {};

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
            e('label', { for : 'pair'}, `Pair：`),
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
        this.state = {files: []};
        glovalState['files'] = [];

        // This binding is necessary to make `this` work in the callback
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange() {
        // render rates
        this.setState({value: event.target.files});
        glovalState['files'] = event.target.files;
    }

    render() {
        return [
            e('label', { for : 'csv'}, `csv：`),
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
            isLoaded: false,
            error: null,
            rows: []
        }
    }

    componentDidMount() {
        var instance = this;
        // for api get
        $.ajax({
            url: 'file:///C:/Users/Administrator/Desktop/test/klines.json?test=' + glovalState['value'],
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
                    e('td', { key : row[1] + index + 'Open'}, `\t${row[1]}`),
                    e('td', { key : row[2] + index + 'High'}, `\t${row[2]}`),
                    e('td', { key : row[3] + index + 'Low'}, `\t${row[3]}`),
                    e('td', { key : row[4] + index + 'Close'}, `\t${row[4]}`)
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
