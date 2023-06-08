// Keep this here!
import 'react-native-gesture-handler';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {NavigationContainer} from '@react-navigation/native';
import BadgerLoginScreen from './components/BadgerLoginScreen';
import {useEffect, useState} from 'react';
import BadgerLandingScreen from './components/BadgerLandingScreen';
import BadgerChatroomScreen from './components/BadgerChatroomScreen';
import BadgerRegisterScreen from './components/BadgerRegisterScreen';
import {Alert, StyleSheet} from "react-native";
import BadgerLogoutScreen from "./components/BadgerLogoutScreen";
import * as SecureStore from 'expo-secure-store';

const ChatDrawer = createDrawerNavigator();

async function save(key, value) {
    await SecureStore.setItemAsync(key, value);
}

async function getValueFor(key) {
    let result = await SecureStore.getItemAsync(key);
}

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [isRegistering, setIsRegistering] = useState(false);
    const [isGuest, setIsGuest] = useState(false);
    const [chatrooms, setChatrooms] = useState([]);

    useEffect(() => {
        fetch("https://cs571.org/s23/hw10/api/chatroom", {
            method: "GET", headers: {
                "X-CS571-ID": "bid_0c1c3460b2b791c2e6cc",
            }
        }).then(res => res.json()).then(json => {
            setChatrooms(json);
        });
    }, []);

    const handleLogout = () => {
        setIsLoggedIn(false);
        setIsRegistering(false);
        SecureStore.deleteItemAsync('jwt').then(r => {
        });
    }

    function handleLogin(username, password) {
        // hmm... maybe this is helpful!
        fetch("https://cs571.org/s23/hw10/api/login", {
            method: "POST", headers: {
                "X-CS571-ID": "bid_0c1c3460b2b791c2e6cc", "Content-Type": "application/json",
            }, body: JSON.stringify({
                username: username, password: password,
            })
        }).then(res => {
            if (res.status === 200) {
                Alert.alert("Successful login!");
                setIsLoggedIn(true);
                return res.json();
            } else if (res.status === 401) {
                Alert.alert("Incorrect password!");
                return null;
            } else if (res.status === 404) {
                Alert.alert("User does not exist!");
                return null;
            }
        }).then(json => {
            if (json !== null) {
                SecureStore.setItemAsync('jwt', json.token).then(() => {
                });
            }
        });
    }

    function handleSignup(username, password) {
        // hmm... maybe this is helpful!
        fetch("https://cs571.org/s23/hw10/api/register", {
            method: "POST", headers: {
                "X-CS571-ID": "bid_0c1c3460b2b791c2e6cc", "Content-Type": "application/json",
            }, body: JSON.stringify({
                username: username, password: password,
            })
        }).then(res => {
            if (res.status === 200) {
                setIsLoggedIn(true);
                setIsGuest(false);
                Alert.alert("Successful Register!");
                return res.json();
            } else if (res.status === 409) {
                Alert.alert("User already exist!");
                return null;
            } else if (res.status === 413) {
                Alert.alert("Username or Password too long!");
                return null;
            }
        }).then(json => {
            if (json !== null) {
                SecureStore.setItemAsync('jwt', json.token).then(r => {
                });
            }
        });
    }

    if (isLoggedIn || isGuest) {
        return (<NavigationContainer>
            <ChatDrawer.Navigator>
                <ChatDrawer.Screen name="Landing" component={BadgerLandingScreen}/>
                {chatrooms.map(chatroom => {
                    return <ChatDrawer.Screen key={chatroom} name={chatroom}>
                        {(props) => <BadgerChatroomScreen name={chatroom} isGuest={isGuest}/>}
                    </ChatDrawer.Screen>
                })}
                {isGuest ? <ChatDrawer.Screen name="Signup" options={{drawerItemStyle: {backgroundColor: "red"}}}>
                        {(props) => <BadgerRegisterScreen handleSignup={handleSignup}
                                                          setIsRegistering={setIsRegistering} isGuest={isGuest}
                                                          setIsGuest={setIsGuest}/>}
                    </ChatDrawer.Screen> :
                    <ChatDrawer.Screen name="Logout" options={{drawerItemStyle: {backgroundColor: "red"}}}>
                        {(props) => <BadgerLogoutScreen key={"logout"} handleLogout={handleLogout}/>}
                    </ChatDrawer.Screen>}
            </ChatDrawer.Navigator>
        </NavigationContainer>);
    } else if (isRegistering) {
        return <BadgerRegisterScreen handleSignup={handleSignup}
                                     setIsRegistering={setIsRegistering}/>
    } else {
        return <BadgerLoginScreen handleLogin={handleLogin}
                                  setIsRegistering={setIsRegistering} setIsGuest={setIsGuest}/>
    }
}

