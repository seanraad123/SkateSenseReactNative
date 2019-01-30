import React, { Component } from "react";
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Animated,
  Image,
  Dimensions,
  TouchableOpacity,
  TextInput
} from "react-native";
import MapView, {
      Callout,
      Overlay,
      MapCallout } from 'react-native-maps'
import { Header, ListItem, Avatar, Icon } from 'react-native-elements'
// import Icon from 'react-native-vector-icons/FontAwesome';
import ActionButton from 'react-native-action-button';
import NewMarkerInfoBoxForm from '../childComponents/newMarkerInfoBoxForm.js'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { fetchKeyForSkateSpots } from '../action.js'
import { withNavigation, DrawerActions } from 'react-navigation'
import environment from '../environment.js'

const { width, height } = Dimensions.get("window");

const CARD_HEIGHT = height / 4;
const CARD_WIDTH = CARD_HEIGHT + 90;

class screens extends Component {
  state = {
    region: {
      latitudeDelta: 0.04864195044303443,
      longitudeDelta: 0.040142817690068,
    }
  }

  UNSAFE_componentWillMount() {
    this.index = 0;
    this.animation = new Animated.Value(0);
  }
  componentDidMount() {
    this.getUserLocationHandler()
    this.props.getSkateSpots()
    // We should detect when scrolling has stopped then animate
    // We should just debounce the event listener here
    if (this.props.user.skate_spots){
    this.animation.addListener(({ value }) => {
      console.log('VALUE', value);
      let index = Math.floor(value / CARD_WIDTH + 0.3); // animate 30% away from landing on the next item
      if (index >= this.props.user.skate_spots.length) {
        index = this.props.user.skate_spots.length - 1;
      }
      if (index <= 0) {
        index = 0;
      }

      clearTimeout(this.regionTimeout);
        this.regionTimeout = setTimeout(() => {
          if (this.index !== index) {
            this.index = index;
            const latitude = this.props.user.skate_spots[index].latitude
            const longitude = this.props.user.skate_spots[index].longitude
            console.log('MY LATITUDE', latitude);
            console.log('MY longitude', longitude);
            this.map.animateToRegion(
              {
                latitude: latitude,
                longitude: longitude,
                latitudeDelta: this.state.region.latitudeDelta,
                longitudeDelta: this.state.region.longitudeDelta,
              },
              350
            );
          }
        }, 10);
      });
    }else {
      console.log('spots havent loaded yet');
    }
  }

  getUserLocationHandler = () => {
    navigator.geolocation.getCurrentPosition(position => {
      this.setState({
        userLocation:{
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.115,
          longitudeDelta: 0.1121,
        },
        geoLocationSwitch: true
      })
    })
  }

  getSearchResults = () =>{
    let spots = this.state.skateSpots
  }

  render() {
    console.log("MAP2 state", this.props);
    const interpolations =
    this.props.user.skate_spots
    ?( this.props.user.skate_spots.map((marker, index) => {
      const inputRange = [
        (index - 1) * CARD_WIDTH,
        index * CARD_WIDTH,
        ((index + 1) * CARD_WIDTH),
      ];
      const scale = this.animation.interpolate({
        inputRange,
        outputRange: [1, 2.5, 1],
        extrapolate: "clamp",
      });
      const opacity = this.animation.interpolate({
        inputRange,
        outputRange: [0.35, 1, 0.35],
        extrapolate: "clamp",
      });
      return { scale, opacity };
    }))
    : null

    return (
      <View style={styles.container}>
        <MapView
          showsUserLocation
          ref={map => this.map = map}
          initialRegion ={this.state.userLocation}
          style={styles.container}
        >

        {this.props.user.skate_spots
          ? this.props.user.skate_spots.map((marker, index) => {
            const scaleStyle = {
              transform: [
                {
                  scale: interpolations[index].scale,
                },
              ],
            };
            const opacityStyle = {
              opacity: interpolations[index].opacity,
            }
            return(
            <MapView.Marker
              key={index}
              coordinate={{latitude:marker.latitude, longitude:marker.longitude}}
              title={marker.name}
              description={marker.description}>
              <Animated.View style={[styles.markerWrap, opacityStyle]}>
                <Animated.View style={[styles.ring, scaleStyle]} />
                <View style={styles.marker} />
              </Animated.View>

            </MapView.Marker>
          )})
          : null}

        </MapView>

        <Overlay>
            <View>
              <Icon
              raised
              name='bars'
              type='font-awesome'
              onPress= {() => this.props.navigation.openDrawer()}
              containerStyle={{
                marginTop: 20,
                marginLeft: 0,
              }}
              color="rgb(244, 2, 87)"
              />

              <Icon
              raised
              name='plus'
              type='font-awesome'
              onPress= {() => this.props.navigation.openDrawer()}
              containerStyle={{
                marginTop: 330,
                marginLeft: 0,
              }}
              color="rgb(244, 2, 87)"

              />

              <Icon
              raised
              name='redo'
              type='font-awesome'
              onPress= {() => this.props.navigation.openDrawer()}
              containerStyle={{
                marginBottom: 5,
                marginLeft: 310,
                marginTop: -140,
              }}
              color="rgb(244, 2, 87)"

              />

              <Icon
              raised
              name='location-arrow'
              type='font-awesome'
              onPress= {() => this.props.navigation.openDrawer()}
              containerStyle={{
                marginRight:0,
                marginBottom: 0,
                marginLeft: 310,
              }}
              color="rgb(244, 2, 87)"
              
              />
            </View>
        </Overlay>




        <Animated.ScrollView
          horizontal
          scrollEventThrottle={1}
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH}
          onScroll={Animated.event(
            [
              {
                nativeEvent: {
                  contentOffset: {
                    x: this.animation,
                  },
                },
              },
            ],
            { useNativeDriver: true }
          )}
          style={styles.scrollView}
          contentContainerStyle={styles.endPadding}
        >
          {this.props.user.skate_spots
           ? this.props.user.skate_spots.map((marker, index) => (
            <View style={styles.card} key={index}>
              <Image
                source={{uri:`http://${environment['BASE_URL']}${marker.skatephoto.url}`}}
                style={styles.cardImage}
                resizeMode="cover"
              />
              <View style={styles.textContent}>
                <Text numberOfLines={1} style={styles.cardtitle}>{marker.name}</Text>
                <Text numberOfLines={1} style={styles.cardDescription}>
                  {marker.description}
                </Text>
              </View>
            </View>
          ))
          : null}
        </Animated.ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  calloutView: {
   flexDirection: "row",
   backgroundColor: "rgba(255, 255, 255, 0.9)",
   borderRadius: 20,
   borderStyle:'solid',
   borderColor:'rgb(236, 229, 235)',
   borderWidth: 1,
   width: "70%",
   marginLeft: "11%",
   marginRight: "30%",
   marginTop: '25%',
   shadowColor: '#000',
   shadowOffset: { width: 0, height: 5 },
   shadowOpacity: 0.3,
   shadowRadius: 3,
  },
  calloutSearch: {
   borderColor: "transparent",
   marginLeft: 10,
   width: "90%",
   marginRight: 10,
   height: 40,
   borderWidth: 0.0
  },
  geoLocationButton:{
    flexDirection: "row",
    marginLeft: "80%",
    marginRight: "30%",
    marginTop: "95%",
  },
  menuButtonContainerStyle:{
    backgroundColor: "rgb(244, 2, 87)",
    height: 60,
    width: 60,
    borderRadius: 50,
    marginLeft: "0%",
    marginRight: "75%",
    marginTop: "50%",
  },
  compass:{
    color: "white",
    fontSize: 25,
  },
  scrollView: {
    position: "absolute",
    bottom: -5,
    left: 0,
    right: 0,
    paddingVertical: 10,
  },
  endPadding: {
    paddingRight: width - CARD_WIDTH,
  },
  card: {
    padding: 10,
    elevation: 2,
    backgroundColor: "#FFF",
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowRadius: 5,
    shadowOpacity: 0.3,
    shadowOffset: { x: 2, y: -2 },
    height: CARD_HEIGHT,
    width: CARD_WIDTH,
    overflow: "hidden",
  },
  cardImage: {
    flex: 3,
    width: "100%",
    height: "100%",
    alignSelf: "center",
  },
  textContent: {
    flex: 1,
  },
  cardtitle: {
    fontSize: 12,
    marginTop: 5,
    fontWeight: "bold",
  },
  cardDescription: {
    fontSize: 12,
    color: "#444",
  },
  markerWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  marker: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(130,4,150, 0.9)",
  },
  ring: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(130,4,150, 0.3)",
    position: "absolute",
    borderWidth: 1,
    borderColor: "rgba(130,4,150, 0.5)",
  },
});

const mapStateToProps = state => {
  return {
    skate_spots: state.skate_spots,
    user: state.user,
  }
}

function mapDispatchToProps(dispatch) {
    return {
      getSkateSpots: () => dispatch(fetchKeyForSkateSpots())
    }
}

const connectMap = connect(mapStateToProps, mapDispatchToProps)

export default withNavigation(compose(connectMap)(screens))
