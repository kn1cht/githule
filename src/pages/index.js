import React, { useRef, useState, useEffect } from "react";
import { fetchData, cleanUsername, contributionsToCounts, getDateStr } from "../utils/export";

import styles from '../styles/App.module.scss'

const INITIAL_LEN = 6;
const MAX_LEN = 20;

const App = () => {
  const initText = () => Array(6).fill('⬜').map(i => new Array(7).fill(i));
  const inputRef = useRef();
  const [canvasText, setCanvasText] = useState(initText());
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [gitHubId, setGitHubId] = useState('');
  const [graphLength, setGraphLength] = useState(INITIAL_LEN);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!data) {
      return;
    }
    drawCanvas();
  }, [data]);

  const normalizedCountToColor = (count) => {
    if(count == 0) return '⬜';
    else if(count < 0.3) return '🟨';
    else return '🟩';
  };
  const handleSubmit = e => {
    e.preventDefault();

    setGitHubId(cleanUsername(gitHubId));
    setLoading(true);
    setError(null);
    setData(null);

    fetchData(cleanUsername(gitHubId))
      .then(res => {
        setLoading(false);
        if (res.years.length === 0) {
          setError("Could not find your profile");
        } else {
          setData(res);
          inputRef.current.blur();
        }
      })
      .catch(err => {
        console.log(err);
        setError("I could not check your profile successfully...");
      });
  };
  const drawCanvas = () => {
    const counts = contributionsToCounts(data).slice(0, graphLength * 7).reverse();
    console.log(counts);
    const maxCount = Math.max(counts.reduce((pre, cur) => Math.max(pre, cur)), 1);

    let canvasTextNew = Array(graphLength).fill('⬜').map(i => new Array(7).fill(i));
    for(let i = 0; i <= graphLength; ++i) {
      const normalizedCountsInOneWeek = counts.slice(i * 7, (i + 1) * 7);
      canvasTextNew[i] = normalizedCountsInOneWeek.map(e => normalizedCountToColor(e / maxCount));
    }
    setCanvasText(canvasTextNew);
  }
  const _renderError = () => {
    return (
      <div className="App-error App-centered">
        <p>{error}</p>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className="title is-2 is-uppercase has-text-centered has-text-weight-bold">GitHule</h1>
      </header>
      <main className="block">
        <div className="box columns">
          <div className="column is-narrow">
            <label className="label">GitHub Username</label>
            <form onSubmit={handleSubmit} className="field has-addons">
              <p className="control">
              <input ref={inputRef} className="input is-medium" type="text"
                    name="github_id" value={gitHubId} pattern="^[A-Za-z\d\-]+$"
                    onChange={e => setGitHubId(e.target.value)} placeholder="Your GitHub Username" autoFocus />
              </p>
              <p className="control">
              <button type="submit" className="button is-medium is-dark"
                      disabled={gitHubId.length <= 0}>Draw</button>
              </p>
            </form>
            {error !== null && _renderError()}
          </div>
          <div className="column">
            from {getDateStr(graphLength * 7)}
            <div className="is-size-3">
              {canvasText.map((row, rowIndex) => (
                <div key={rowIndex}>
                  {row.map((text, columnIndex) => (
                    <span key={columnIndex}>{text}</span>
                  ))}
                </div>
              ))}
            </div>
            to {getDateStr()}
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <a href="https://github.com/kn1cht/githule" target="_blank" rel="noopener noreferrer">
          <i className="fab fa-github"></i> kn1cht/githule
        </a>
      </footer>
      <div className={'modal' + (loading === true ? ' is-active' : '')}>
        <div className="modal-background"></div>
        <div className={'modal-content fa-3x ' + styles.loading}>
          <i className="fas fa-spinner fa-pulse"></i>
        </div>
      </div>
    </div>
  )
}

export default App
