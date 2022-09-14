import './App.css';
import { Container, Navbar, NavbarBrand, Alert } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { BrowserRouter } from 'react-router-dom';
import Switch from "react-switch";
import { useEffect, useState, useRef } from 'react';
import { debounce } from 'lodash';
import axios from 'axios';
import NumberFormat from 'react-number-format';
import CurrentInput from 'react-currency-input-field';
import 'react-confirm-alert/src/react-confirm-alert.css';
import LoadingBox from './components/LoadingBox';
import MessageBox from './components/MessageBox';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // optional

function App() {
  const [initialCapital, setInitialCapital] = useState("");
  const [error, setError] = useState("");
  const [capitalError, setCapitalError] = useState("");
  const [payout, setPayout] = useState("");
  const [payoutError, setPayoutError] = useState("");
  const [maxEntries, setMaxEntries] = useState("");
  const [maxEntriesError, setMaxEntriesError] = useState("");
  const [maxWins, setMaxWins] = useState("");
  const [maxWinsError, setMaxWinsError] = useState("");
  const [winrate, setWinrate] = useState(0);
  const [nextEntry, setNextEntry] = useState("");
  const [expectedResult, setExpectedResult] = useState("");
  const [total_wins, setTotal_wins] = useState("");
  const [total_losses, setTotal_losses] = useState("");
  const [total_winrate, setTotal_winrate] = useState("");
  const [loading, setLoading] = useState(false);
  const entriesResults = useRef([]);
  const debouncedReloadValues = useRef(
    debounce(async (capital, max_entries, max_wins, payout, results) => {
      setLoading(true);
      const request = {
        capital: parseFloat(capital),
        total_ops: parseInt(max_entries),
        gain_ops: parseInt(max_wins),
        payout: parseFloat(payout),
        type_management: "normal",
        previous_results: results
      };
      try {

        const response = await axios.post('https://money-mgr-app.herokuapp.com/api/masaniello/nextentry', request);//axios.post('http://localhost:8887/api/masaniello/nextentry', request);
        setError("");
        setNextEntry(response.data.nextentry_value);
        setExpectedResult(response.data.expectedReturn);
        setTotal_wins(response.data.total_wins);
        setTotal_losses(response.data.total_losses);
        if ((response.data.total_wins + response.data.total_losses) > 0) {
          let total_winrate = (response.data.total_wins / (response.data.total_wins + response.data.total_losses)) * 100;
          setTotal_winrate(Math.round(total_winrate * 100) / 100);
        } else {
          setTotal_winrate(0);
        }
        entriesResults.current = response.data.entries_results;
      }
      catch (err) {
        setError(err.response.data)
      }
      finally {
        setLoading(false);
      }
    }, 500)
  ).current;

  const handleResult = (result) => {
    let results = entriesResults.current.map(r => { return r.entryResult });
    results.push(result);
    debouncedReloadValues(initialCapital, maxEntries, maxWins, payout, results);
  };

  const handleResultChange = (index, value) => {
    let results = entriesResults.current.map(r => { return r.entryResult }).splice(0, entriesResults.current.length - (index + 1));
    results.push(value);
    debouncedReloadValues(initialCapital, maxEntries, maxWins, payout, results);
  };
  const resetPreviousResults = () => {
    debouncedReloadValues(initialCapital, maxEntries, maxWins, payout, []);
  }
  useEffect(() => {
    if (!initialCapital) {
      setCapitalError("Please enter the amount of your initial investment.");
    } else {
      setCapitalError("");
    }
    if (!payout) {
      setPayoutError("Please enter the amount your win will be multiplied by.");
    } else {
      setPayoutError("");
    }
    if (!maxEntries) {
      setMaxEntriesError("Please enter maximum number of entries.");
    } else {
      setMaxEntriesError("");
    }
    if (!maxWins) {
      setMaxWinsError("Please enter the maximum number of wins desired.");
    } else {
      setMaxWinsError("");
    }
    if (maxEntries && maxWins) {
      if (parseInt(maxWins) > parseInt(maxEntries)) {
        setMaxEntriesError("The number of entries must be greater than the number of wins.");
        setMaxWinsError("The number of wins cannot be greater than the number of entries.");
      } else {
        let win_rate = (parseInt(maxWins) / parseInt(maxEntries)) * 100;
        setWinrate(Math.round(win_rate * 100) / 100);
        setMaxWinsError("");
        setMaxEntriesError("");
        entriesResults.current = [];
        debouncedReloadValues(initialCapital, maxEntries, maxWins, payout, entriesResults.current.map(r => { return r.entryResult }));
      }
    }

  }, [initialCapital, payout, maxEntries, maxWins, debouncedReloadValues]);
  return (
    <BrowserRouter>
      <div className="d-flex flex-column site-container">
        <header className="App-header">
          <Navbar className="nav-bar" variant="dark">
            <Container>
              <LinkContainer to="/">
                <NavbarBrand>
                  <strong>Position Size Manager</strong> <small>by Thilcun</small>
                </NavbarBrand>
              </LinkContainer>
            </Container>
          </Navbar>
        </header>
        <main>
          <div className="container main-box pt-3 pb-3">
            <div className="form-card p-3 m-3 rounded">
              <h3>Masaniello Calculator</h3>
              <div className="row mb-2">
                <div className="col-md-6">
                  <div className="form-group">
                    <label className="form-label">Initial Capital <Tippy placement='right' content="The total amount of capital willing to risk"><i className="fa fa-info-circle"></i></Tippy></label>
                    <input className={(capitalError === "") ? "form-control form-control-sm" : "form-control form-control-sm validation-error"}
                      required type="number" value={initialCapital} onChange={e => setInitialCapital(e.target.value)} />
                    {(capitalError) &&
                      <div className="validation-text">
                        {capitalError}
                      </div>}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label className="form-label">Payout</label>
                    <input className={(payoutError === "") ? "form-control form-control-sm" : "form-control form-control-sm validation-error"} required type="number" value={payout} onChange={e => setPayout(e.target.value)} />
                    {(payoutError) &&
                      <div className="validation-text">
                        {payoutError}
                      </div>}
                  </div>
                </div>
              </div>
              <div className="row mb-2">
                <div className="col-sm-6">
                  <div className="form-group">
                    <label className="form-label">Max Entries</label>
                    <input className={(maxEntriesError === "") ? "form-control form-control-sm" : "form-control form-control-sm validation-error"} required type="number" value={maxEntries} onChange={e => setMaxEntries(e.target.value)} />
                    {(maxEntriesError) &&
                      <div className="validation-text">
                        {maxEntriesError}
                      </div>}
                  </div>
                </div>
                <div className="col-sm-5">
                  <div className="form-group">
                    <label className="form-label">Max Wins</label>
                    <input className={(maxWinsError === "") ? "form-control form-control-sm" : "form-control form-control-sm validation-error"} required type="number" value={maxWins} onChange={e => setMaxWins(e.target.value)} />
                    {(maxWinsError) &&
                      <div className="validation-text">
                        {maxWinsError}
                      </div>}
                  </div>
                </div>
                <div className="col-sm-1">
                  <div className="form-group">
                    <label className="form-label">Win %</label>
                    <input className="form-control form-control-sm px-2" readOnly type="number" value={winrate} />
                  </div>
                </div>
              </div>
              {error ? (
                <div className="row mx-1 my-3">
                  <MessageBox variant="danger">{error}</MessageBox>
                </div>
              ) : (
                <>
                  {expectedResult &&
                    (
                      <div className="row border border-warning rounded my-3 mx-1 pt-3 pb-3 next-value-strip">
                        { loading ? <div className="col-sm-12"><LoadingBox /></div> : (
                          <>
                            <div className="col-sm-6 d-flex justify-content-center">
                              {(total_wins >= maxWins) || (total_losses > (maxEntries - maxWins)) ? <div className="row h-25"><Alert variant="warning">No further entries.</Alert></div> : (
                                <>
                                  <div className="w-75">
                                    <div className="row mb-2">
                                      <div className="form-group">
                                        <label className="form-label">Next Entry Value</label>
                                        <CurrentInput name="next_value" className="form-control form-control-sm" readOnly decimalsLimit={2} prefix="$" value={nextEntry} />
                                      </div>
                                    </div>
                                    <div className="d-flex flex-row mb-1">
                                      <button type="button" className="btn btn-success me-1 btn-md" onClick={() => { handleResult(true); }}>{`Win ($${(Math.round((nextEntry * (payout - 1)) * 100) / 100)})`}</button>
                                      <button type="button" className="btn btn-danger btn-md" onClick={() => { handleResult(false); }}>{`Loss (-$${Math.round(nextEntry * 100) / 100})`}</button>
                                    </div>
                                    <div className="row">
                                      <p className="warning"><span>Warning:</span> Make sure to test every possible outcome, as the entry value might be below the minimum amount of your possible trade and it might even be $0 before the total losses allowed has been reached.</p>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                            <div className="col-sm-6">
                              <div className="form-group">
                                <label className="form-label">Expected Return <Tippy placement="right" content="This is the estimated amount if the number of max wins is reached (Initial Capital is added to this value)"><i className="fa fa-info-circle fa-fw"></i></Tippy></label>
                                <CurrentInput name="expected_return" className="form-control-plaintext form-control-sm ps-2" readOnly decimalsLimit={2} prefix="$" value={expectedResult} type="text" />
                              </div>
                              <div className="row">
                                <div className="form-group col-sm-4">
                                  <label className="form-label">Total Wins</label>
                                  <input type="text" readOnly className="form-control-plaintext form-control-sm ps-2" value={total_wins} />
                                </div>
                                <div className="form-group col-sm-4">
                                  <label className="form-label">Total Losses</label>
                                  <input type="text" readOnly className="form-control-plaintext form-control-sm ps-2" value={total_losses} />
                                </div>
                                <div className="form-group col-sm-4">
                                  <label className="form-label">Win Rate</label>
                                  <input type="text" readOnly className="form-control-plaintext form-control-sm ps-2" value={total_winrate} />
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )
                  }
                  <div className="row">
                    <div className="col-sm-12 table-responsive">
                      <table className="table table-sm results-table">
                        <thead>
                          <tr>
                            <th>Entry #</th>
                            <th>Value</th>
                            <th>Result</th>
                            <th>Payout Amount</th>
                            <th>Resulting Capital</th>
                            <th>Win Rate</th>
                            <th>Wins Needed</th>
                            <th>Losses Left</th>
                          </tr>
                        </thead>
                        {!loading && (
                          <tbody>
                            {[...entriesResults.current].reverse().map((result, index) => (
                              <tr key={index}>
                                <td>{result.entryNumber}</td>
                                <td><NumberFormat value={result.entryValue} displayType='text' thousandSeparator={true} prefix='$' decimalScale={2} fixedDecimalScale={true} /></td>
                                <td>
                                  <Switch id="resultSwitch" checked={result.entryResult} onChange={() => { handleResultChange(index, !result.entryResult); }} offColor='#ff0000' />
                                </td>
                                <td><NumberFormat value={result.payoutAmount} displayType='text' thousandSeparator={true} prefix='$' decimalScale={2} fixedDecimalScale={true} /></td>
                                <td><NumberFormat value={result.currentCapital} displayType='text' thousandSeparator={true} prefix='$' decimalScale={2} fixedDecimalScale={true} /></td>
                                <td><NumberFormat value={result.winPercentage} displayType='text' thousandSeparator={false} suffix='%' decimalScale={2} fixedDecimalScale={true} /></td>
                                <td>{result.gainsLeft}</td>
                                <td>{result.lossesLeft}</td>
                              </tr>
                            ))}
                          </tbody>
                        )}
                      </table>
                      {(entriesResults.current.length > 0 && !loading) &&
                        (<div className="d-flex">
                          <button type="button" className="btn btn-warning me-1" onClick={() => { resetPreviousResults() }}>Reset</button>
                        </div>)}
                      {(entriesResults.current.length < 1 && !loading) &&
                        (<Alert variant={"warning"}>
                          There are no previous results.
                        </Alert>)}
                      {loading && <LoadingBox />}
                    </div>
                  </div>
                </>)}
              <div className="row mt-3">
                <div className="col-sm-12 disclaimer">
                  <h4>Disclaimer</h4>
                  <ul>
                    <li>Trading is VERY risky. So do it at your own risk.</li>
                    <li>This tool is not to be used as a financial or investment advice.</li>
                    <li>Masaniello Calculator has been tested and has been giving the desired results. But we do not assume any responsability on any bugs or mistakes it might occur.</li>
                    <li>This is meant to be used for educational purposes. Therefore, we assume no responsability on any misusage.</li>
                    <li>We will never contact you or request any personal information.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
        <footer>
          <div className="text-center">Developed by thilcun</div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
