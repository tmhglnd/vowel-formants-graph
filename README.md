# vowel-formants-graph

An exploration of different vowel formant datasets with interactive synthesis in p5. I constructed a combined json file from the various datasetes with in my opinion best sounding formants to give a good representation of the possible vowels. This is all done by ear. This set is named `formants-constructed.json`

![screenshot](media/screenshot.png)

# Usage

```
$ git clone https://github.com/tmhglnd/vowel-formants-chart.git
```

```
$ cd vowel-formants-chart
```

```
$ python3 -m http.server
--- OR ---
$ python -m SimpleHTTPServer
```

```
$ open http://localhost:8000
```

Select any of the sets to display in the graph. Use the cursor to navigate the set and see the formant frequencies. Click to hear the sound, constructed of a sawtooth oscillator with 3 bandpass filters in p5.sound.
