import styled from 'styled-components/native';

export const Container = styled.SafeAreaView`
    align-items: center;
`;
export const View = styled.View`
    flex: 1;
    background-color: #f0f4ff;
`;
export const Message = styled.Text`
    font-size: 20px;
    font-weight: bold;
    margin-top: 20px;
`;

export const Name = styled.Text`
    font-size: 24px;
    margin-bottom: 24px;
    margin-top: 10px;
    padding: 0 14px;
    color: #121212;
`;

export const NameLink = styled.TouchableOpacity`
    background-color: #3b3dbf;
    width: 90%;
    height: 40px;
    border-radius: 8px;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
`;

export const NewText = styled.Text`
    color: #fff;
    font-size: 16px;
    font-weight: bold;
`;

export const LogoutButton = styled.TouchableOpacity`
    border-width: 1px;
    border-color: #c62c36;
    border-radius: 8px;
    width: 90%;
    height: 40px;
    border-radius: 8px;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
`;

export const LogoutText = styled.Text`
    font-size: 16px;
    font-weight: bold;
    color: #c62c36;
`;
