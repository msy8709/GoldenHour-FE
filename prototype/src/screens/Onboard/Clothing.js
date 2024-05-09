import { AppState , Modal, Animated, StyleSheet, Text, View, Image, Button, Dimensions } from 'react-native';
import {wScale, hScale, SCREEN_HEIGHT} from '../../utils/scaling';
import RegularText from '../../component/ui/regular-text';
import react, {useEffect,useRef, useState} from 'react';
import CircleButton from '../../component/ui/buttons/circle-button';
import Success from '../../../src/assets/success.png';
import Fail from '../../../src/assets/fail.png';
import ModalBtn from '../../component/ui/buttons/modal-button';
import { useNavigation } from '@react-navigation/native';
import { setSavedEtcTime } from '../../stores/ready-time-slice';
import { useSelector, useDispatch } from 'react-redux';


export default function Clothing(){
    const appState = useRef(AppState.currentState);
    const [appStateVisible, setAppStateVisible] = useState(appState.current); 
    // 씻기에서 아낀 시간
    const savedWasingTime = useSelector((state) => state.readyTime.savedWasingTime);
    // 옷입기를 완료한 시점
    const etcCompletedTime = useSelector((state) => state.readyTime.etcCompletedTime);
    // 옷입기를 위해 할당된 시간
    const etcTime = useSelector((state) => state.readyTime.etcTime) * 60;
    // 화면이 로드된 시점에서 옷입기를 완료하기까지 남은 시간
    const [currentRemainTime, setCurrentRemainTime] = useState(Math.floor((etcCompletedTime - new Date().getTime())/(1000) - savedWasingTime));
    // 전체 옷입기 시간에서 소비한 시간의 비율
    const [clothingTimePersent, setClothingTimePersent] = useState(1 - (currentRemainTime/etcTime));

    const [timeLeft, setTimeLeft] = useState();
    const [time, setTime] = useState(etcTime);
    const [isRunning, setIsRunning] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [failModalOpen, setFailModalOpen] = useState(false);
    const [animatedValue, setAnimatedValue] = useState(new Animated.Value(SCREEN_HEIGHT * clothingTimePersent));
    const navigation = useNavigation();

    const dispatch = useDispatch();

    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
        if(
            appState.current.match(/inactive|background/) && 
            nextAppState === 'active'
        ){
            const remain = Math.floor((etcCompletedTime - new Date().getTime())/(1000))
            setCurrentRemainTime(remain);
            const persent = 1 - (remain/etcTime);
            setClothingTimePersent(persent);
            const animeatedValue_ = new Animated.Value(SCREEN_HEIGHT * persent);
            setAnimatedValue(new Animated.Value(SCREEN_HEIGHT * persent));
        }
        appState.current = nextAppState;
        setAppStateVisible(appState.current);
    });

    return () => {
        subscription.remove();
    };
},[]);

useEffect(() => {
    let interval;
    if (isRunning){
        // Animated.timing(animatedValue, {
        // toValue: SCREEN_HEIGHT,
        // duration: time * 1000 ,
        // useNativeDriver: false,
    // }).start();
    
    interval = setInterval(() => {
        const remain = (etcCompletedTime - new Date().getTime())/(1000);
        setCurrentRemainTime(remain);
        const persent = 1 - (remain/etcTime);
        setClothingTimePersent(persent);
        setTime((prevTime) => {
                if(prevTime <= 1){
                    clearInterval(interval);
                    setIsRunning(false);
                    autoModalOpen();
                    return 0;
                }
                return Math.floor(Math.floor((etcCompletedTime - new Date().getTime())/(1000) - savedWasingTime)) -1;
        })
    }, 10);
    return () => clearInterval(interval);
}
}, [isRunning]);
    

    const onPressModalOpen = () => {
        setModalOpen(true);
        setIsRunning(false);
        setTimeLeft(time);
        Animated.timing(animatedValue).stop();
    }

    const autoModalOpen = () => {
        setFailModalOpen(true);
    }
    

    const onPressModalClose = () => {
        setModalOpen(false);
        setFailModalOpen(false);
    }

    const formattedTime = (time) => {
        const hour = Math.floor(time / 3600);
        const remainingSeconds = time % 3600;
        const minute = Math.floor(remainingSeconds / 60);
        const second = remainingSeconds % 60
        
        return `${hour.toString().padStart(2, '0')} : ${minute.toString().padStart(2, '0')} : ${second.toString().padStart(2, '0')}`;
    }

    const formattedTime2 = (time) => {
        const minute = Math.floor(time / 60);
        const second = time % 60
        
        return `${minute.toString().padStart(1, '0')} 분 ${second.toString().padStart(1, '0')} 초`;
    }
    const onModalNext = () => {
        if(time > 0){
            dispatch(setSavedEtcTime(time));
        }
        onPressModalClose();
        navigation.navigate('Moving');
    }

    return(
        <View style={styles.background}>
            <View style={styles.component}>
                <RegularText style={styles.text}>지금은 옷입고</RegularText>
                <RegularText style={styles.text}>준비하는 시간 !</RegularText>
                <RegularText style={styles.text1}>{formattedTime(time)}</RegularText>
                <CircleButton children='완료' color="#7AFFB7" onPress={() => onPressModalOpen()}/>
            </View>
            {/* <Animated.View style={[styles.colorback,{ height: animatedValue.interpolate({inputRange: [0, SCREEN_HEIGHT],outputRange: [0,SCREEN_HEIGHT],})}]} /> */}
            <View style={[styles.colorback, {height:SCREEN_HEIGHT * clothingTimePersent}]} /> 
            <Modal animationType='slide' visible = {modalOpen} transparent={true}>
            <View style={styles.modalContainer}>
                <View style={styles.modalBack}/>
                <View style={styles.modal}>
                    <Image source={Success} style={styles.img}></Image>
                    <RegularText style={styles.modalText}>{formattedTime2(time)} 아끼셨네요</RegularText>
                    <ModalBtn style={styles.btn}children='다음' onPress={onModalNext}/>
                </View>
                </View>
            </Modal>
            
            <Modal animationType='slide' visible = {failModalOpen} transparent={true}>
            <View style={styles.modalContainer}>
                <View style={styles.modalBack}/>
                <View style={styles.modal}>
                    <Image source={Fail} style={styles.img}></Image>
                    <RegularText style={styles.modalText}>지각 예정이에요..!</RegularText>
                    <RegularText style={styles.modalText}>서둘러 주세요.</RegularText>
                    <ModalBtn style={styles.btn}children='다음' onPress={onModalNext}/>
                </View>
                </View>
            </Modal>
            
            
        </View>
    )
    
}
const styles = StyleSheet.create({
    background: {
        backgroundColor: "#FFFFFF",
        flex: 1,
        // width:'100%',
        // height: '100%',
        alignItems: 'center',
        flexDirection: 'column-reverse',
    },
    colorback: {
        backgroundColor: "#7AFFB7",
        // flex: 1,
        // width:hScale(SCREEN_HEIGHT),
        width: '100%',
        transition: '1s',
        zIndex: 1
    },
    text: {
        fontFamily: 'Pretendard-Bold',
        
    },
    text1: {
        fontFamily: 'Pretendard-Bold',
        marginBottom: hScale(300),
        marginTop: hScale(20)
    },
    component : {
        position: 'absolute',
        flex: 1,
        bottom:hScale(100),
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5,
    },
    modalContainer:{
        flex: 1,
        justifyContent:'center',
        alignItems: 'center'
    },
    modalBack:{
        position:'absolute',
        top:0,
        left:0,
        width:'100%',
        height: '100%',
        justifyContent:'center',
        alignItems: 'center',
        backgroundColor: '#000000',
        opacity: .6,
        zIndex: 3
    },
    modal: {
        backgroundColor:'#FFFFFF',
        width: wScale(280),
        height: hScale(380),
        justifyContent:'center',
        alignItems:'center',
        borderRadius: wScale(20),
        zIndex: 6,
        opacity: 1,
    },
    modalText: {
        fontFamily:'Pretendard-Bold',
        fontSize: wScale(20)
    },
    img: {
        width: wScale(80),
        height: hScale(80),
        marginTop:hScale(80),
        marginBottom:hScale(20)
    },
    btn: {
        marginTop:hScale(80)
    }
})