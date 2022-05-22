import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import {useState} from 'react';
import {Database} from "./database";
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

const Connexion=({id, username, admin, navigation}) => {
    const [isPressed, setIsPressed] = useState(false);
    const [page, setChangePage] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    return <Pressable 
    style={isPressed?[styles.pressable, styles.pressed]:styles.pressable}
    key={id}
    onPressIn={ () => setIsPressed(true) }     
    onPressOut={ () => {setIsPressed(false); navigation.navigate("Magasin", {id:id, username:username, admin:admin});} }
    >
      <Text style={styles.username}>{username}</Text>
    </Pressable>
}

export default function App() {

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Accueil" component={HomeScreen}/>
        <Stack.Screen name="Magasin" component={PageMagasin}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const HomeScreen = ({navigation}) => {

  const db = new Database("DB_Mobile");
  const [Connexions, setConnexions] = useState();
  const [currentConnexion, setCurrentConnexion] = useState(0);
  const vide="Aucun Usager n'existe!";

  db.execute("drop table if exists Connexions ;");
  db.execute("CREATE TABLE IF NOT EXISTS Connexions (id INTEGER primary key autoincrement, username TEXT, admin INTEGER);");
  db.execute(`insert into Connexions (username, admin) values('user1', 0),('user2', 0),('admin1', 1);`);
  db.execute(`Select id, username, admin from Connexions`).then(sel => setConnexions(sel.rows));

  return (
    <View style={styles.container}>
      {Connexions ? Connexions.map((c) =>
        <Connexion
        id={c.id}
        username={c.username}
        admin={c.admin}
        navigation={navigation}
        >

        </Connexion>
      ) : <Text>{vide}</Text>}
      <StatusBar style="auto" />
    </View>
  );
}

const PageMagasin = ({navigation, route}) => {
  const {id, username, admin} = route.params
  return (
    <Text>
      Bonjour : {username}
    </Text>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  salut: {
    flex: 1
  },
  pressable: {
    backgroundColor: "#6699ff",
    padding : 10,
    margin : 4,
    borderRadius: 10
  },
  pressed: {
    backgroundColor: "#99bbff",
  },
  username: {
    color:"white",
    fontWeight: "bold",
    fontSize: 15
  }
});