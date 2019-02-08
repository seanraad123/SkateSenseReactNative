import React, {Component} from 'react'
import { View,
         Text,
         StyleSheet,
         Image,
         ScrollView,
         Linking,
         TouchableWithoutFeedback,
         Switch} from 'react-native'
import { Header, Icon, Card, ListItem, Button } from 'react-native-elements'
// import Icon from 'react-native-vector-icons/FontAwesome';
import environment from '../environment.js'
import { withNavigation } from 'react-navigation'
import deviceStorage from '../deviceStorage.js'


const styles = StyleSheet.create({
  container: {
      textDecorationColor:'black',
      color:'black',
      flex: 1,
      backgroundColor: 'white',
      resizeMode: 'stretch'
    },
})

class UserPage extends Component {
  constructor(props){
    super(props)
    this.state={
      isOn: false,
    }
  }


  render(){
    console.log(this.props.navigation.getParam('user'));
    return(
      <View style={styles.container}>
        <Header
          leftComponent={{ icon: 'menu' , color: 'black', onPress: () => this.props.navigation.openDrawer()}}
          centerComponent={{ fontFamily:'Lobster', text: `${this.props.navigation.getParam('user').username}`, style: { color: 'black', fontSize: 25 } }}
          backgroundColor='white'
          containerStyle={{
             fontFamily:'Lobster',
             justifyContent: 'space-around',
           }}/>

          <Text>
            Comments and posts
          </Text>

          <ScrollView>
            {this.props.navigation.getParam('user')
               ?this.props.navigation.getParam('user').comments.map((comment, i) => (
                 <View>
                  <TouchableWithoutFeedback onPress={()=> { this.props.navigation.navigate('UserPage')}}>
                     <ListItem
                       title={comment.content}
                     />
                   </TouchableWithoutFeedback>
                  </View>
               ))
               :null
             }
          </ScrollView>
      </View>
    )
  }

}



export default withNavigation(UserPage)
