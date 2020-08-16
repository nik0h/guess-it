import * as React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableHighlight,
  ImageBackground,
  StatusBar,
  AsyncStorage,
  Share,
  Modal,
} from 'react-native';
import {
  AdMobBanner,
  AdMobRewarded
} from 'expo-ads-admob';
import Dialog, { DialogFooter, DialogButton, DialogContent, DialogTitle } from 'react-native-popup-dialog';
import Constants from 'expo-constants';
import * as Font from 'expo-font';
import { Asset } from 'expo-asset';
import { SplashScreen, AppLoading } from 'expo';
import { Audio } from 'expo-av';

AdMobRewarded.setAdUnitID('ca-app-pub-3940256099942544/5224354917');

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { uri: require("./assets/qa.png"),
      score: 0,
      fail: false,
      visible: false,
      disableRewardedBtn: false,
      adAvailable: true,
      highScore: '',
      isReady: false,
      gotScore: false,
      share: false,
    };
    console.disableYellowBox = true;

    Audio.Sound.createAsync(require("./assets/audio.mp3"), {isLooping: true, shouldPlay: true, volume: 0.8});
  }

  async componentDidMount() {
    await this._getScore();
    this.setState({ gotScore: true });
    AdMobRewarded.addEventListener("rewardedVideoDidRewardUser", () =>
      this.reward()
    );
    AdMobRewarded.addEventListener("rewardedVideoDidOpen", () =>
      this.setState({ disableRewardedBtn: false })
    );
    AdMobRewarded.addEventListener("rewardedVideoDidFailToLoad", () =>
      this.setState({ disableRewardedBtn: false })
    );
  }

  _getScore = async () => {
    try {
      const value = await AsyncStorage.getItem('highScore');
      if (value !== null) {
        this.setState({ highScore: value });
      }
      if (value == null) {
        await AsyncStorage.setItem('highScore', '0');
        this.setState({ highScore: '0' });
      }
    } catch (error) {}
  };

  _setScore = async () => {
    try {
      await AsyncStorage.setItem('highScore', this.state.score.toString());
    } catch (error) {}
  };

  _rmScore = async () => {
    try {
      await AsyncStorage.removeItem('highScore');
      this._getScore();
    } catch (error) {}
  };

  reward() {
    if (this.state.visible)
      this.setState({ visible: false, adAvailable: false, disableRewardedBtn: false });
  }

  _openRewarded = async () => {
    try {
      this.setState({ disableRewardedBtn: true });
      await AdMobRewarded.requestAdAsync();
      await AdMobRewarded.showAdAsync();
    } catch (error) {}
    finally {
      this.setState({ disableRewardedBtn: false });
    }
  }

  shareScore = async () => {
    try {
      if (this.state.share) {
        const result = await Share.share({
          message: 'I just got a streak of ' + this.state.score + ' on Guess It!',
        });
      }
      if (!this.state.share) {
        const result = await Share.share({
          message: 'I\'ve gotten a top streak of ' + this.state.highScore + ' on Guess It!',
        });
      }
    } catch (error) {}
  };

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async checkNum(u) {
      if (this.state.locked)
        return;
      var numGen = Math.floor(Math.random()*10)+1;
      switch (numGen){
        case 1:
          this.setState({uri: require("./assets/1a.png")});
          break;
        case 2:
          this.setState({uri: require("./assets/2a.png")});
          break;
        case 3:
          this.setState({uri: require("./assets/3a.png")});
          break;
        case 4:
          this.setState({uri: require("./assets/4a.png")});
          break;
        case 5:
          this.setState({uri: require("./assets/5a.png")});
          break;
        case 6:
          this.setState({uri: require("./assets/6a.png")});
          break;
        case 7:
          this.setState({uri: require("./assets/7a.png")});
          break;
        case 8:
          this.setState({uri: require("./assets/8a.png")});
          break;
        case 9:
          this.setState({uri: require("./assets/9a.png")});
          break;
        case 10:
          this.setState({uri: require("./assets/10a.png")});
          break;
      }
      if (numGen == u){
        Audio.Sound.createAsync(require("./assets/y.mp3"), {shouldPlay: true, volume: 1});
        this.setState({ score: this.state.score+1 });
      }
      if (numGen != u){
        Audio.Sound.createAsync(require("./assets/n.mp3"), {shouldPlay: true, volume: 1});
        if (this.state.score == 0)
          this.setState({ fail: true });
        if (this.state.score != 0 && this.state.adAvailable)
          this.setState({ visible: true });
        if (!this.state.adAvailable)
          this.setState({ share: true });
      }
  }

  _appIntro = async () => {
    this.setState({ isReady: true });
    await this.sleep(1250);
    SplashScreen.hide();
  };

  async _cacheResourcesAsync() {
    const images = [require('./assets/bg.png'),
      require("./assets/qa.png"),
      require("./assets/1a.png"),
      require("./assets/2a.png"),
      require("./assets/3a.png"),
      require("./assets/4a.png"),
      require("./assets/5a.png"),
      require("./assets/6a.png"),
      require("./assets/7a.png"),
      require("./assets/8a.png"),
      require("./assets/9a.png"),
      require("./assets/10a.png")];

    const cacheImages = images.map(image => {
      return Asset.fromModule(image).downloadAsync();
    });

    await Font.loadAsync({
      '04b30': require('./assets/04b30f.ttf'),
    });

    return Promise.all(cacheImages);
  }

  render() {
    const { hue, sat, val } = this.state;
    if (!this.state.isReady) {
      return (
        <AppLoading
          startAsync={this._cacheResourcesAsync}
          onFinish={() => this._appIntro()}
          onError={console.warn}
          autoHideSplash={false}
        />
      ); }

    if (this.state.score > this.state.highScore){
      this.setState({ highScore: this.state.score });
      this._setScore();
    }
    return (
      <ImageBackground fadeDuration={0} source={require('./assets/bg.png')} style={{width: '100%', height: '100%', flex: 1}}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.container}>
          <View style={styles.mainDiv}>
            <Dialog
              visible={this.state.share}
              styles={styles.dialog}
              footer={
                  <DialogFooter>
                    <DialogButton
                      text="Share!"
                      onPress={() => {this.shareScore()}}
                      textStyle={{fontFamily: '04b30', textAlign: 'center', fontSize: 18, padding: 10}}
                    />
                    <DialogButton
                      text="Retry!"
                      disabled={this.state.disableRewardedBtn}
                      onPress={() => {this.setState({ share: false, adAvailable: true, score: 0, uri: require("./assets/qa.png")});}}
                      textStyle={{fontFamily: '04b30', textAlign: 'center', fontSize: 18, padding: 10}}
                    />
                  </DialogFooter>
                }
              dialogTitle={
                  <DialogTitle
                    title='Want to share your score or keep going?'
                    align='center'
                    textStyle={{fontFamily: '04b30', textAlign: 'center', fontSize: 18, padding: 10}}
                  />
                }
              >
            </Dialog>
            <Dialog
              visible={this.state.visible}
              styles={styles.dialog}
              footer={
                  <DialogFooter>
                    <DialogButton
                      text="Quit..."
                      onPress={() => {this.setState({ visible: false, share: true });}}
                      textStyle={{fontFamily: '04b30', textAlign: 'center', fontSize: 18, padding: 10}}
                    />
                    <DialogButton
                      text="Continue!"
                      disabled={this.state.disableRewardedBtn}
                      onPress={() => {this._openRewarded();}}
                      textStyle={{fontFamily: '04b30', textAlign: 'center', fontSize: 18, padding: 10}}
                    />
                  </DialogFooter>
                }
              dialogTitle={
                  <DialogTitle
                    title='Use a free unlock and keep your streak going!'
                    align='center'
                    textStyle={{fontFamily: '04b30', textAlign: 'center', fontSize: 18, padding: 10}}
                  />
                }
              >
            </Dialog>
            <Dialog
              visible={this.state.fail}
              styles={styles.dialog}
              footer={
                  <DialogFooter style={{}}>
                    <DialogButton
                      text="Try again!"
                      onPress={() => {this.setState({ fail: false, score: 0, uri: require("./assets/qa.png")});}}
                      textStyle={{fontFamily: '04b30', textAlign: 'center', fontSize: 18, padding: 10}}
                    />
                  </DialogFooter>
                }
              dialogTitle={
                  <DialogTitle
                    title='You guessed the number wrong...'
                    align='center'
                    textStyle={{fontFamily: '04b30', textAlign: 'center', fontSize: 18, padding: 10}}
                  />
                }
              >
            </Dialog>
            <View style={{flex: 0.2, justifyContent: 'space-around'}}>
                <Text style={styles.paragraph}>
                  Guess It!
                </Text>
            </View>
            <View style={styles.playContainer}>
              <View style={styles.randNum}>
                <View style={styles.randView}>
                  <Image source={this.state.uri} resizeMode='contain' style={styles.randImg}/>
                </View>
              </View>
              <View style={styles.parent}>
                <TouchableHighlight activeOpacity={ 0.75 } underlayColor='#333' onPress={() => this.checkNum(1)} style={styles.child}>
                  <Image fadeDuration={0} source={require('./assets/1a.png')} resizeMode='contain' style={{height: '100%', maxWidth: '100%', aspectRatio: 1}}/>
                </TouchableHighlight>
                <TouchableHighlight activeOpacity={ 0.75 } underlayColor='#333' onPress={() => this.checkNum(2)} style={styles.child}>
                  <Image fadeDuration={0} source={require('./assets/2a.png')} resizeMode='contain' style={{height: '100%', maxWidth: '100%', aspectRatio: 1}}/>
                </TouchableHighlight>
                <TouchableHighlight activeOpacity={ 0.75 } underlayColor='#333' onPress={() => this.checkNum(3)} style={styles.child}>
                  <Image fadeDuration={0} source={require('./assets/3a.png')} resizeMode='contain' style={{height: '100%', maxWidth: '100%', aspectRatio: 1}}/>
                </TouchableHighlight>
                <TouchableHighlight activeOpacity={ 0.75 } underlayColor='#333' onPress={() => this.checkNum(4)} style={styles.child}>
                  <Image fadeDuration={0} source={require('./assets/4a.png')} resizeMode='contain' style={{height: '100%', maxWidth: '100%', aspectRatio: 1}}/>
                </TouchableHighlight>
                <TouchableHighlight activeOpacity={ 0.75 } underlayColor='#333' onPress={() => this.checkNum(5)} style={styles.child}>
                  <Image fadeDuration={0} source={require('./assets/5a.png')} resizeMode='contain' style={{height: '100%', maxWidth: '100%', aspectRatio: 1}}/>
                </TouchableHighlight>
                <TouchableHighlight activeOpacity={ 0.75 } underlayColor='#333' onPress={() => this.checkNum(6)} style={styles.child}>
                  <Image fadeDuration={0} source={require('./assets/6a.png')} resizeMode='contain' style={{height: '100%', maxWidth: '100%', aspectRatio: 1}}/>
                </TouchableHighlight>
                <TouchableHighlight activeOpacity={ 0.75 } underlayColor='#333' onPress={() => this.checkNum(7)} style={styles.child}>
                  <Image fadeDuration={0} source={require('./assets/7a.png')} resizeMode='contain' style={{height: '100%', maxWidth: '100%', aspectRatio: 1}}/>
                </TouchableHighlight>
                <TouchableHighlight activeOpacity={ 0.75 } underlayColor='#333' onPress={() => this.checkNum(8)} style={styles.child}>
                  <Image fadeDuration={0} source={require('./assets/8a.png')} resizeMode='contain' style={{height: '100%', maxWidth: '100%', aspectRatio: 1}}/>
                </TouchableHighlight>
                <TouchableHighlight activeOpacity={ 0.75 } underlayColor='#333' onPress={() => this.checkNum(9)} style={styles.child}>
                  <Image fadeDuration={0} source={require('./assets/9a.png')} resizeMode='contain' style={{height: '100%', maxWidth: '100%', aspectRatio: 1}}/>
                </TouchableHighlight>
                <TouchableHighlight activeOpacity={ 0.75 } underlayColor='#333' onPress={() => this.checkNum(10)} style={styles.child}>
                  <Image fadeDuration={0} source={require('./assets/10a.png')} resizeMode='contain' style={{height: '100%', maxWidth: '100%', aspectRatio: 1}}/>
                </TouchableHighlight>
              </View>
            </View>
            <View style={{flex: 0.2, width: '100%', justifyContent: 'center'}}>
              <Text style={{fontSize: 24, textAlign: 'center', fontFamily: '04b30', color: '#333'}}>
                Score: {this.state.score}
              </Text>
              {(this.state.gotScore)? (
                <Text style={{fontSize: 24, textAlign: 'center', fontFamily: '04b30', color: '#333', paddingBottom: 8}}>
                  High Score: {this.state.highScore}
                </Text>
              ) : null}
              <TouchableHighlight activeOpacity={ 0.75 } underlayColor='#333' onPress={() => this.shareScore()} style={styles.shareButton}>
                <Text style={{fontSize: 20, display: 'inline', textAlign: 'center', fontFamily: '04b30', color: '#FB98FA', textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: {width: 0, height: 0}, textShadowRadius: 3}}>
                  Share Best Score!
                </Text>
              </TouchableHighlight>
            </View>
          </View>
          <View style={{flex: .06, justifyContent:'center', width: '100%'}}>
            <AdMobBanner bannerSize={"smartBannerPortait"} adUnitID={'ca-app-pub-3940256099942544/6300978111'} style={{alignSelf: 'center', height: '100%'}}/>
          </View>
        </View>
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
    paddingLeft: 8,
    paddingRight: 8,
    paddingBottom: 25,
    alignItems: 'center',
  },
  paragraph: {
    fontSize: 28,
    textAlign: 'center',
    fontFamily: '04b30',
    color: '#333',
  },
  parent: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 0.5,
    alignContent: 'center',
    justifyContent: 'space-around',
  },
  child: {
    width: '18%',
    margin: '1%',
    aspectRatio: 1,
    overflow: 'hidden',
    borderRadius: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  shareButton: {
    borderRadius: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 8,
  },
  randNum: {
    flex: 0.5,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  randView: {
    aspectRatio: 1,
    borderRadius: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    flex: 0.6,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  randImg: {
    height: '100%',
    maxWidth: '100%',
    aspectRatio: 1,
  },
  dialog: {
    width: '80%',
  },
  mainDiv: {
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'column',
    flex: .94,
  },
  playContainer: {
    //backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingTop: '2%',
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'column',
    flex: 0.6,
    borderRadius: 10,
  },
  modal: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
