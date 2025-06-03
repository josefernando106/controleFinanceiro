import styled from 'styled-components/native';

export const Background = styled.View`
  flex: 1;  
  Background-color: #F0F4FF;
`;

export const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

export const Logo = styled.Image`
    margin-bottom: 20px;  
`;
export const AreaInput = styled.View`
    flex-direction: row;
`;
export const Input = styled.TextInput`
    background-color: #FFF;
    width: 90%;
    font-size: 17px;
    padding: 10px;
    border-radius: 8px;
    color: #121212;
    margin-bottom: 10px;
    height: 60px;
`;

export const SubmitButton = styled.TouchableOpacity`
    width: 90%;
    height: 54px;
    border-radius: 8px;
    background-color: #3b3bdf;
    margin-top: 10px;
    justify-content: center;
    `;
    
export const SubmitText = styled.Text`
    fonty-size: 20px;
    text-align: center;
    color: #FFF;
`;
export const Link = styled.TouchableOpacity`
    margin-top: 10px;
    margin-bottom: 10px;
`;

export const LinkText = styled.Text`
  color: #3b3bdf;
`;