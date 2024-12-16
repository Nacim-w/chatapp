import * as SMS from 'expo-sms';
import * as Location from 'expo-location';
import call from 'react-native-phone-call'


export async  function sendLocation(phoneNumber) {
    let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      console.log({location});
        const latitude = location.coords.latitude;
            const longitude = location.coords.longitude;
            const message = `My current location is: https://www.google.com/maps?q=${latitude},${longitude}`;
            return message;
            // sendSms(phoneNumber, message);
    
}

export function makePhoneCall(phoneNumber) {
  call({
    number:phoneNumber ,
    prompt: false,
    skipCanOpen: true
  }).catch(console.error)
}