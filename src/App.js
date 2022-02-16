import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { getTokenOrRefresh } from './token_util';
import './custom.css'
import { ResultReason } from 'microsoft-cognitiveservices-speech-sdk';

const speechsdk = require('microsoft-cognitiveservices-speech-sdk')


export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            displayText: 'INITIALIZED: ready to test speech...'
        }
    }
    
    async componentDidMount() {
        // check for valid speech key/region
        const tokenRes = await getTokenOrRefresh();
        if (tokenRes.authToken === null) {
            this.setState({
                displayText: 'FATAL_ERROR: ' + tokenRes.error
            });
        }
    }

    async sttFromMic() {
        const tokenObj = await getTokenOrRefresh();
        const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(tokenObj.authToken, tokenObj.region);
        speechConfig.speechRecognitionLanguage = 'en-US';
        
        const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
        const recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);

        this.setState({
            displayText: 'speak into your microphone...'
        });

        recognizer.recognizeOnceAsync(result => {
            let displayText;
            const synthesizer = new speechsdk.SpeechSynthesizer(speechConfig);
       

            if (result.reason === ResultReason.RecognizedSpeech) {
                //let words = "App, Color, Taxi, Navigation, Airport, Maps";
                if(result.text.includes('taxi') || result.text.includes('Taxi') ){
                  displayText = `Suggested app is: Text=${result.text}`;
                }else if(result.text.includes('color') || result.text.includes('Color')){
                  displayText = `Suggested app is Seeing AI by Microsoft`;
                }
                else if(result.text.includes('navigation') || 
                        result.text.includes('airport') || 
                        result.text.includes('maps') ||
                        result.text.includes('directions') ||
                        result.text.includes('Navigation') || 
                        result.text.includes('Airport') || 
                        result.text.includes('Maps') ||
                        result.text.includes('Directions')){
                    displayText = `Suggested app is Google Maps, a web mapping platform and consumer application offered by Google. 
                                It offers satellite imagery, aerial photography, street maps, 360° interactive panoramic views of streets, 
                                real-time traffic conditions, and route planning for traveling by foot, car, bike, air and public transportation.`;
                }
                else{
                  displayText = `RECOGNIZED: Text=${result.text}`;
                  
                }
            } else {
                displayText = 'ERROR: Speech was cancelled or could not be recognized. Ensure your microphone is working properly.';
            }
            synthesizer.speakTextAsync(
                displayText,
                result => {
                synthesizer.close();
                return result.audioData;
            },
                error => {
                console.log(error);
                synthesizer.close();
            });

            this.setState({
                displayText: displayText
            });
        });
    }

    async fileChange(event) {
        const audioFile = event.target.files[0];
        console.log(audioFile);
        const fileInfo = audioFile.name + ` size=${audioFile.size} bytes `;

        this.setState({
            displayText: fileInfo
        });

        const tokenObj = await getTokenOrRefresh();
        const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(tokenObj.authToken, tokenObj.region);
        speechConfig.speechRecognitionLanguage = 'en-US';

        const audioConfig = speechsdk.AudioConfig.fromWavFileInput(audioFile);
        const recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);

        recognizer.recognizeOnceAsync(result => {
            let displayText;
            if (result.reason === ResultReason.RecognizedSpeech) {
                displayText = `RECOGNIZED: Text=${result.text}`
    

            } else {
                displayText = 'ERROR: Speech was cancelled or could not be recognized. Ensure your microphone is working properly.';
            }

            this.setState({
                displayText: fileInfo + displayText
            });
        });
    }

    render() {
        return (
            <Container className="app-container">
                <div className="row align-items-md-stretch">
                    <div className="col-md-6 sp-box">
                        <div className="h-100 p-5 bg-light border shadow mb-5 bg-white rounded text-center d-flex align-items-center flex-column justify-content-center">
                            <h2>Convert speech to text from your mic</h2>
                            <div className="mic-btn position-relative">
                                <i className="fas fa-microphone fa-lg text-center position-absolute" onClick={() => this.sttFromMic()}></i>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 sp-box">
                        <div className="h-100 p-5 bg-light border shadow mb-5 bg-white rounded text-center d-flex align-items-center flex-column justify-content-center">
                            <h2>Convert speech to text from an audio file</h2>
                                <label htmlFor="audio-file" className="file-btn position-relative"><i className="fas fa-file-audio fa-lg text-center position-absolute"></i></label>
                                    <input 
                                        type="file" 
                                        id="audio-file" 
                                        onChange={(e) => this.fileChange(e)} 
                                        style={{display: "none"}} 
                                    />
                        </div>
                    </div>
                </div>

                <div className="mt-3">
                    <div className="p-5 bg-light border shadow mb-5 bg-white rounded">
                        <div>{this.state.displayText}</div>
                    </div>
                </div>
            </Container>
        );
    }
}