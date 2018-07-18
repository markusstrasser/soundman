const Monophonics = class {
    constructor(callback = function () {
        console.log("Your callback could be here")
    }) {

        //SETTING UP WEB AUDIO
        window.AudioContext = window.AudioContext || window.webkitAudioContext; //as of spring 2017...maybe need to add more prefixes later
        this.audioCtx = new window.AudioContext(); //TODO prefix add

        //Setup analyser
        this.analyserNode = this.audioCtx.createAnalyser(); //automatically creates and CONNECTS AnalyserNode to AudioSource
        this.analyserNode.fftSize = 16384; //default is 2048...for the tonedeaf...; HAS TO be multiple of 2
        this.analyserNode.minDecibels = -80;
        this.data = new Uint8Array(this.analyserNode.frequencyBinCount); //TODO: make UI option between 4 ArrayDataTypes

        this.BINCOUNT = 500; //covers until Midi 88
        this.THRESHOLD = 50;

        this.hzPerBin = this.audioCtx.sampleRate / this.analyserNode.fftSize; //the range every bin captures

        //GETTING MIC ACCESS
        navigator.getUserMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

        navigator.getUserMedia({audio: true}, (stream) => { //arrow function needed to make 'this...' work properly
            stream.onended = () => console.log('Stream ended');
            const source = this.audioCtx.createMediaStreamSource(stream);//set the stream to link to the AudioContext...it's strange I know
            source.connect(this.analyserNode); //this is working in the background...so might need to unplug somehow if performance is issue
            // console.log("STREAM: " + stream, "SOURCE: " + source)
            // console.log('started my Loop -PP');
            this.gotStream = true;
            callback(); //optional
        }, function (err) {
            alert("Looks like you denied Microphone access or your browser blocked it. \nTo make it work: " +

                "\n\n>In 95% of cases: Click the green/secure bar or green lock icon left of the URL address bar (left of https://dacapo....)\n " +
                "\n\n If you can't see it: Check the -Settings- in your browser " +
                "\n\n>In CHROME it's | Settings => Content settings => Microphone| \n" +
                "\n>You can also try to reload the page and if nothing helps update your browser / delete your cookies \n" +
                "\n>If you are on Safari or Internet Explorer I lost all hopes for you \n" +
                "\n Good Luck!")
        });
        this.heighestEnergy;
    }

    //TICK TICK TICK ...every frame or whatever
    updateEnergyValues() { //needs data which needs a stream which needs a audiocontext ladilalalala
        this.analyserNode.getByteFrequencyData(this.data); //TODO make this link to user choice

        this.segment = this.data.slice(0, this.BINCOUNT);
        //ATTENTION --> indexes might get mixed up if beginning isn't 0 //so .filter,.slice,.splice will cause bugs later on

        this.heighestEnergy = 0;
        this.heighestEnergyIdx = 0;
        for (let i = 0; i < this.segment.length; i++) {
            const binEnergy = this.segment[i]

            if (binEnergy > this.heighestEnergy && binEnergy > this.THRESHOLD) { //update the chosen one
                this.heighestEnergy = binEnergy;
                this.heighestEnergyIdx = i;
            }
        }
        this.normBinIdx = this.correctToLowestPeak(this.heighestEnergyIdx, this.segment); //independet from mySpec
    }

    correctToLowestPeak(biggestIdx, spectrumData) {
        let newIdx = biggestIdx; //by default
        for (let i = 2; i < 6; i++) //could be better: only divide by 2, 3, 5 (and then again 2 to cover every 1/2-1/10 fundamental fraction)
        {
            const smallerIdx = Math.round(biggestIdx / i);
            const ratio = spectrumData[biggestIdx] / spectrumData[smallerIdx];
            if (ratio > 0.3 && ratio < 8) //if energies are close together...
            {
                //---check neighbors to be sure
                if (spectrumData[smallerIdx] > spectrumData[smallerIdx + 1]) { //compares neighors energy values
                    newIdx = smallerIdx;
                }
                if (spectrumData[smallerIdx + 1] > spectrumData[smallerIdx]) { //dafuq
                    newIdx = smallerIdx + 1;
                }
                if (spectrumData[smallerIdx - 1] > spectrumData[smallerIdx]) { //
                    newIdx = smallerIdx - 1;
                }
            }
        }
        return newIdx;
    }
    isHarmonic(bin, segment = this.segment) {
        const certainty = [];
        const ratios = [];
        for (let multiple = 2; multiple <= 3; multiple++) {
            let ratio = segment[bin] / segment[bin * multiple]
            ratios.push(ratio)
        }
        const legit = ratios.every(r =>
            r > 0.25 && r < 10 //legit range
            && !isNaN(r)
            && r !== Infinity
        );
        return legit
    }
    binToMidi(bin) {
        if (Array.isArray(bin)) {
            throw new UserException('dont input array as argument');
        }
        return this.hzToMidi(bin * this.hzPerBin);
    }

    hzToMidi(Hz) {
        if (Hz <= 0) {
            return -1;
        }
        const multipleOfBase = Hz / 8.1757989156; //8.17 is C0 which is MIDI 0 for standard tuning
        const midi = 12 * getBaseLog(2, multipleOfBase); //2 as base because = 1 octave
        if (midi < 0) {
            return -1
        }
        else return midi;

        function getBaseLog(x, y) { //returns the logarithm of y with base x (ie. logxy):
            return Math.log(y) / Math.log(x);
        }
    }

    midiToHz(midi) {
        let base = 8.1757989156; //Midi 0 according to: "THE INTERNET"
        let totalOctaves = 10; //from midi 0 to midi 120
        let multiplier = Math.pow(2, totalOctaves * midi / 120); //genius! forgot why
        let frequency = base * multiplier; // in HZ
        return frequency;
    }

    midiToBin(midi) {
        return this.midiToHz(midi) / this.hzPerBin;
    }

    midiToHSLa(midi, s = "100%", l = "60%", a = 1) { //HSL is more intuitive then RGB s=100, l =60;
        const segments = 12;
        midi = midi % segments;
        let h = 360 - (midi * 360 / segments) + 60; //Hue goes gradually around (COUNTERCLOCK) the wheel at pitch '6' => 180deg
        if (h == 360) {
            h = 0;
        }
        return "hsla" + "(" + h + "," + s + "," + l + "," + a + ")";
    }

    midiToNoteName(midi, which = "none") {
        midi = Math.round(midi);
        const allNoteNames = [
            //    "C -2","C# -2","D -2","D# -2", "E -2","F -2","F# -2","G -2", "G# -2", "A -2", "A# -2", "B -2", //some note it differently
            "C -1", "C# -1", "D -1", "D# -1", "E -1", "F -1", "F# -1", "G -1", "G# -1", "A -1", "A# -1", "B -1",
            "C 0", "C# 0", "D 0", "D# 0", "E 0", "F 0", "F# 0", "G 0", "G# 0", "A 0", "A# 0", "B 0",
            "C 1", "C# 1", "D 1", "D# 1", "E 1", "F 1", "F# 1", "G 1", "G# 1", "A 1", "A# 1", "B 1",
            "C 2", "C# 2", "D 2", "D# 2", "E 2", "F 2", "F# 2", "G 2", "G# 2", "A 2", "A# 2", "B 2",
            "C 3", "C# 3", "D 3", "D# 3", "E 3", "F 3", "F# 3", "G 3", "G# 3", "A 3", "A# 3", "B 3",
            "C 4", "C# 4", "D 4", "D# 4", "E 4", "F 4", "F# 4", "G 4", "G# 4", "A 4", "A# 4", "B 4",
            "C 5", "C# 5", "D 5", "D# 5", "E 5", "F 5", "F# 5", "G 5", "G# 5", "A 5", "A# 5", "B 5",
            "C 6", "C# 6", "D 6", "D# 6", "E 6", "F 6", "F# 6", "G 6", "G# 6", "A 6", "A# 6", "B 6",
            "C 7", "C# 7", "D 7", "D# 7", "E 7", "F 7", "F# 7", "G 7", "G# 7", "A 7", "A# 7", "B 7",
            "C 8", "C# 8", "D 8", "D# 8", "E 8", "F 8", "F# 8", "G 8", "G# 8", "A 8", "A# 8", "B 8",
        ];
        const chromaticC3 = [ //could also produce allNoteNames from this with Midi knowledge
            "C",
            "C''",
            "D",
            "D''",
            "E",
            "F",
            "F''",
            "G",
            "G''",
            "A",
            "A''",
            "B",
            "C"
        ];
        return which === "deluxe" ? allNoteNames[midi] : chromaticC3[midi % 12];
    }
}
