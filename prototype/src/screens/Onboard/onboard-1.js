import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, Button } from 'react-native';
import {wScale, hScale, SCREEN_WIDTH, SCREEN_HEIGHT} from '../../utils/scaling';
import RegularText from '../../component/ui/regular-text'

import {useDispatch, useSelector} from "react-redux";

import { setColor } from '../../stores/color-slice';
import { plusNumber } from '../../stores/test-slice';
import clock from '../../assets/onboard1/clock.png'
import FullSizeButton from '../../component/ui/buttons/full-size-button';
import { useNavigation } from '@react-navigation/native';


export default function Onboard_1() {
    const navigation = useNavigation();

    const color = useSelector((state) => state.color.value);
    const number = useSelector((state) =>state.number.value)

    const dispatch = useDispatch();

    return(
        <View style={[styles.continer, {backgroundColor:color}]}>
            <RegularText style={styles.script}>늦지 않게 해드릴게요!</RegularText>
            <Button onPress={() => dispatch(setColor())} title='이걸 누르면 색깔이 막 바뀌어용!'></Button>
            <FullSizeButton onPress={() => navigation.navigate('Onboard_2')} children="시작하기"/>
        </View>
    )
}

const styles = StyleSheet.create({
    continer:{
        flex:1,
        width:'100%',
        justifyContent: 'center',
        alignItems: 'center',
    },

    script:{
        fontFamily:'Pretendard-Bold',
        marginTop:hScale(300)
    }
});