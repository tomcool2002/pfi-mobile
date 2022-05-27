import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Pressable, FlatList, Image, ScrollView } from 'react-native';
import {useState} from 'react';
import {Database} from "./database";
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TextInput,Button,Alert,useWindowDimensions } from 'react-native';
import NumericInput from 'react-native-numeric-input';
import MapView,{Marker,Callout,PROVIDER_GOOGLE} from 'react-native-maps';
import entrepots from "./entrepot.json"

const Stack = createNativeStackNavigator();

export default function App() {
  
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Accueil" component={HomeScreen}/>
        <Stack.Screen name="PageConnexion" component={PageConnexion}/>
        <Stack.Screen name="Magasin" component={PageMagasin}/>
        <Stack.Screen name="PageDétails" component={PageDétails}/>
        <Stack.Screen name="PagePanier" component={PagePanier}/>
        <Stack.Screen name="PageAdmin" component={PageAdmin}/>
        <Stack.Screen name="PageAjouterItem" component={PageAjouterItem}/>
        <Stack.Screen name="PageRetirerItem" component={PageRetirerItem}/>
        <Stack.Screen name="PageMap" component={PageMap}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const PageMap = ({navigation, route}) =>{
  const [isPressed, setIsPressed] = useState(false);
  const {id, username, admin} = route.params

  const initialRegion = {
    latitude : 45.4735448,
    longitude: - 73.5639533,
    latitudeDelta: 1,
    longitudeDelta: 1
  }
  const [region,setRegion] = useState(initialRegion)
  const {height,width} = useWindowDimensions()
  return (
    <View style={styles.container}>
      <MapView style={{width:width,height:height}} 
      provider={PROVIDER_GOOGLE}
      region = {region}>
        {entrepots.map(b => <Marker key={b.id}
             coordinate={b.coord} 
             >
               <Callout>
                 <Text>{b.nom}</Text>
                 <Text>{b.text}</Text>
               </Callout>
             </Marker>)}
      </MapView>
      <Text style={styles.footer}>
        Fait Par Anthony Lamothe et Thomas Lavoie
      </Text>
    </View>
  )

}
const Connexion=({id, username, admin, navigation}) => {
  const [isPressed, setIsPressed] = useState(false);
  return <Pressable
    style={isPressed?[styles.pressable, styles.pressed]:styles.pressable}
    key={id}
    onPressIn={ () => setIsPressed(true) }
    onPressOut={ () => {
        setIsPressed(false);
        admin == 0 ? navigation.navigate("Magasin", {id:id, username:username, admin:admin}) : navigation.navigate("PageAdmin", {id:id, username:username, admin:admin});
      }
    }
  >
    <Text style={styles.username}>{username}</Text>
  </Pressable>
}

const Produit = ({id, nom, prix, image, username, navigation}) => {
  const [isPressed, setIsPressed] = useState(false);

  return <Pressable
  style={[isPressed?[styles.pressable, styles.pressed]:styles.pressable, styles.produit]}
  key={id}
  onPressIn={ () => setIsPressed(true) }
  onPressOut={ () => {
      setIsPressed(false);
      navigation.navigate("PageDétails", {id:id, nom:nom, prix:prix, image:image, username:username});
    }
  }
  >
      <Text style={styles.centeredText}>
        {nom}
      </Text>
      <Text style={styles.centeredText}>
        {prix} $
      </Text>
  </Pressable>
};

const db = new Database("DB_Mobile");

const HomeScreen = ({navigation}) => {
  const [Connexions, setConnexions] = useState();
  const [currentConnexion, setCurrentConnexion] = useState(0);
  const vide="Aucun Usager n'existe!";

  db.execute("drop table if exists Connexions ;");
  db.execute("CREATE TABLE IF NOT EXISTS Connexions (id INTEGER primary key autoincrement, username TEXT, admin INTEGER);");
  db.execute(`insert into Connexions (username, admin) values('user1', 0),('user2', 0),('admin1', 1);`);
  db.execute(`Select id, username, admin from Connexions`).then(sel => setConnexions(sel.rows));

  db.execute("drop table if exists Panier ;");
  db.execute("CREATE TABLE IF NOT EXISTS Panier (id INTEGER primary key autoincrement, nom TEXT, prix REAL, image TEXT, username TEXT, qte INTEGER);");
  db.execute("insert into Panier (nom, prix, image, username, qte) values('produit1', 10.10, 'image1.png', 'user1', 2)");

  return (
    <View style={styles.container}>
      {Connexions ? Connexions.map((c) =>
        <Connexion
        key={c.id}
        id={c.id}
        username={c.username}
        admin={c.admin}
        navigation={navigation}
        />
      ) : <Text>{vide}</Text>}
      <StatusBar style="auto" />
      <Text style={styles.footer}>
        Fait Par Anthony Lamothe et Thomas Lavoie
      </Text>
    </View>
  );
}

const PageConnexion = ({navigation, route}) => {
  const {id, username, admin} = route.params
  return (
    <View style={styles.container}>
      <Text>
        Bonjour {username}
      </Text>
    </View>
  );
}

// Affiche une liste des items
const PageMagasin = ({navigation, route}) => {
  const [isPressed, setIsPressed] = useState(false);

  const [Produits, setProduits] = useState();
  db.execute("drop table if exists Produits ;");
  db.execute("CREATE TABLE IF NOT EXISTS Produits (id INTEGER primary key autoincrement, nom TEXT, prix REAL, image TEXT);");
  db.execute(`insert into Produits (nom, prix, image) values('produit1', 10.10, 'image1.jpg'),
  ('produit2', 20.20, 'image2.png'),('produit1', 30.30, 'image3.png'),
  ('produit2', 20.20, 'image2.png'),('produit1', 30.30, 'image3.png'),
  ('produit2', 20.20, 'image2.png'),('produit1', 30.30, 'image3.png'),
  ('produit4', 40.40, 'image4.png');`);
  db.execute(`Select id, nom, prix, image from Produits`).then(sel => setProduits(sel.rows));

  const {id, username, admin} = route.params;
  return (
    <View style={styles.container}>
      <Text>
        Bonjour : {username}
      </Text>

        <ScrollView style={styles.scrollDownList}>
          {Produits ? Produits.map((p) =>
            <Produit
            key={p.id}
            id={p.id}
            nom={p.nom}
            prix={p.prix}
            image={p.image}
            username={username}
            navigation={navigation}
            />
          ) : <Text>Aucun item ne figure dans la bd</Text>}
        </ScrollView>

      <StatusBar style="auto" />
      <Text style={styles.footer}>
        Fait Par Anthony Lamothe et Thomas Lavoie
      </Text>
    {/* Affiche le bouton panier */}
      <Pressable
        style={[isPressed?[styles.pressable, styles.pressed]:styles.pressable, styles.btnBasDroite]}
        key={id}
        onPressIn={ () => setIsPressed(true) }
        onPressOut={ () => {
            setIsPressed(false);
            navigation.navigate("PagePanier", {id:id, username:username, admin:admin});
          }
        }>
          <Text style={styles.btnText}>
            Panier
          </Text>
      </Pressable>
      <Pressable
        style={[isPressed?[styles.pressable, styles.pressed]:styles.pressable, styles.btnBasGauche]}
        onPressIn={ () => setIsPressed(true) }
        onPress={ () => {
            navigation.navigate("Accueil", {id:id, username:username, admin:admin});
          }
        }>
          <Text style={styles.btnText}>
            déconnexion
          </Text>
      </Pressable>
    </View>
  );
}

const PageDétails  = ({navigation, route}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [qteAchat, setQteAchat] = useState(1);
  const {id, nom, prix, image, username} = route.params;
  let path = "./" + image;
  return (
    <View style={styles.conteneurDetails}>
      <Text>
        Bonjour : {username}
      </Text>

      <Text style={styles.nomItemDetails}>{nom}</Text>
      <Image style={styles.imageDetails} source={require("./image1.jpg")} />
      {/* <Image style={styles.imageDetails} source={require("./"+image)} />   */}
      <Text style={styles.prixItemDetails}>
        Prix de l'item # {id} : {prix}$
      </Text>

      <NumericInput
        onChange={(value) => setQteAchat(value)}
        type='up-down'
        minValue={1}
        maxValue={10}/>

      <Pressable
        style={[isPressed?[styles.pressable, styles.pressed]:styles.pressable , styles.btnBasDroite]}
        onPress={ () => {
          alert(qteAchat + " x ajoutés au panier");
          db.execute("insert into Panier (nom, prix, image, username, qte) values('"+ nom +"', "+ prix +", '"+ image +"', '"+ username +", "+ qteAchat + "')");}}>
        <Text style={styles.btnText}>Ajouter au panier</Text>
      </Pressable>

      <Pressable
        style={[isPressed?[styles.pressable, styles.pressed]:styles.pressable , styles.btnBasGauche]}
        onPress={ () => navigation.goBack()}>
        <Text style={styles.btnText}>
          retour
        </Text>
      </Pressable>
    </View>
  );
}

const Panier = ({id, nom, prix,username, image,qte, navigation}) => {
  const [isPressed, setIsPressed] = useState(false);

  return <Pressable
  style={[isPressed?[styles.pressable, styles.pressed]:styles.pressable, styles.produit]}
  key={id}
  onPressIn={ () => setIsPressed(true) }
  onPressOut={ () => {
      setIsPressed(false);
      Alert.alert(
        "Enlevez " + {nom} + " ?",
        "Confimez",
        [
          {
            text:"Annuler"
          },
          {
            Text:"Enlevez",
            onPress:() => {db.execute("Delete from Panier where id = " + id);}
          }
        ]
      );
    }
  }
  >
      <Text style={styles.centeredText}>
        {nom}
      </Text>
      <Text style={styles.centeredText}>
        {prix} $
      </Text>
  </Pressable>
};
// Affiche la page de Panier. Affiche les items se trouvant dans le panier de l'utilisateur
// Possibilité de retirer un item en appuyant dessus (Affiche un pop-up lorsqu'on clique dessus)
// Retire tous les items du panier lorsqu'on achète le panier.

const PagePanier = ({navigation, route}) => {
  const [isPressed, setIsPressed] = useState(false);

  const [Paniers, setPaniers] = useState();

  db.execute("CREATE TABLE IF NOT EXISTS Panier (id INTEGER primary key autoincrement, nom TEXT, prix REAL, image TEXT, username TEXT,qte REAL);");
  db.execute("Select id,nom,prix,username,image,qte from Panier").then(res => setPaniers(res.rows))

  const {id, username, admin} = route.params;
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollDownList}>
          {Paniers ? Paniers.map((p) =>
            <Panier
            key={p.id}
            id={p.id}
            nom={p.nom}
            prix={p.prix}
            username={p.username}
            image={p.image}
            qte={p.qte}
            navigation={navigation}
            />   
          ) : <Text>Aucun item ne figure dans la bd</Text>}
        </ScrollView>
        <Pressable
        style={[isPressed?[styles.pressable, styles.pressed]:styles.pressable, styles.btnBasDroite]}
        key={id}
        onPressIn={ () => setIsPressed(true) }
        onPressOut={ () => {
            setIsPressed(false);
            navigation.navigate("PageMap", {id:id, username:username, admin:admin});
          }
        }>
          <Text style={styles.btnText}>
            Acheter
          </Text>
      </Pressable>
      <Text>
        Bonjour : {username}
      </Text>
      <Text style={styles.footer}>
        Fait Par Anthony Lamothe et Thomas Lavoie
      </Text>
    </View>
  )


}

// Affiche la page d'admin, lui donnant seulement 2 options : ajouter un item et retirer un item
const PageAdmin = ({navigation, route}) => {
  const [isPressed, setIsPressed] = useState(false);

  const {id, username, admin} = route.params
  return (
    <View style={styles.container}>
      <Pressable
        style={isPressed?[styles.pressable, styles.pressed]:styles.pressable}
        key={id}
        onPressIn={ () => setIsPressed(true) }
        onPress={ () => {
            setIsPressed(false);
            navigation.navigate("PageAjouterItem", {id:id, username:username, admin:admin});
          }
        }
      >
        <Text style={styles.btnText}>
          Ajouter Un Item
        </Text>
      </Pressable>

      <Pressable
        style={isPressed?[styles.pressable, styles.pressed]:styles.pressable}
        key={id}
        onPressIn={ () => setIsPressed(true) }
        onPressOut={ () => {
            setIsPressed(false);
            navigation.navigate("PageRetirerItem", {id:id, username:username, admin:admin});
          }
        }
      >
        <Text style={styles.btnText}>
          Retirer Un Item
        </Text>
      </Pressable>

      <Text style={styles.footer}>
        Fait Par Anthony Lamothe et Thomas Lavoie
      </Text>
    </View>
  );
}

const PageAjouterItem = ({navigation, route}) => {
  const {id, username, admin} = route.params

  const itemInitial = {
    nom: "",
    prix: 0,
    image:"",
  };

  const AjoutItem = () =>{
    Alert.alert('Item ajouter', item.nom + " a bien ete ajoute",[
      {
        text:'ferme',
      }
    ]);
    db.execute("insert into Produits (nom, prix, image) values('"+item.nom+"', '"+item.prix+"', '"+item.image+".png');");
  }
  const [item,setItem] = useState(itemInitial);

  return (
    <View style={styles.container}>
      <Text>
        Bonjour {username}
      </Text>
      <TextInput value={item.nom} onChangeText={(nom) => setItem({...item,nom})} placeholder="nom de l'objet"/>
      <TextInput value={item.prix} onChangeText={(prix) => setItem({...item,prix})} placeholder="prix de l'objet" keyboardType='numeric' maxLength={10}/>
      <TextInput value={item.image} onChangeText={(image) => setItem({...item,image})} placeholder="nom de l'image"/>
      <Button
        onPress={AjoutItem}
        title="soumettre l'objet"
      />
    </View>
  );
}

// À COMPLÉTER
// Suggestion : Faire un copié collé de page de détails, sauf que quand on
// appuie sur un item, on a un message de confirmation pour le supprimer
const PageRetirerItem = ({navigation, route}) => {
  const {id, username, admin} = route.params

  return (
    <View style={styles.container}>
      <Text>
        Bonjour {username}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  conteneurDetails: {
    height: "100%",
  },
  pressable: {
    backgroundColor: "#6699ff",
    padding : 10,
    margin : 4,
    borderRadius: 10,
  },
  pressed: {
    backgroundColor: "#99bbff",
  },
  username: {
    color:"white",
    fontWeight: "bold",
    fontSize: 15,
  },
  scrollDownList :{
    paddingHorizontal: 60,
  },
  produit: {
    borderColor: "black",
    borderWidth: 1,
    paddingVertical: 30,
    paddingHorizontal: 75,
  },
  centeredText: {
    textAlign: "center",
    color: "white",
  },
  footer: {
    backgroundColor: "white",
    textAlign: "center",
    width: "100%",
    borderTopColor: "black",
    borderTopWidth: 1,
    position: "absolute",
    bottom: 5,
  },
  btnText : {
    color: "white",
  },
  btnBasDroite :{
    borderColor: "black",
    borderWidth: 1,
    position: "absolute",
    padding: 20,
    bottom: 30,
    right: 10,
  },
  btnBasGauche :  {
    borderColor: "black",
    borderWidth: 1,
    position: "absolute",
    padding: 20,
    bottom: 30,
    left: 10,
  },
  imageDetails: {
    width: "100%",
    height: "30%",
  },
  nomItemDetails: {
    textAlign: "center",
    marginVertical: 60,
  },
  prixItemDetails: {
    textAlign: "center",
    marginVertical: 60,
  },
});
