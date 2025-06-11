import styles from 'styled-components/native';

export const Container = styles.View`
    flex: 1;
    background-color: rgba(34,34,34, 0.4)
`;

export const ModalContent = styles.View`
    flex: 2;
    justify-content: center;
    background-color: #fff;
    padding: 12px;
`;

export const ButtonFilter = styles.TouchableOpacity`
    border-radius: 4px;
    background-color: #3b3dbf;
    height: 45px;
    align-items: center;
    justify-content: center;
`;
export const ButtonFilterText = styles.Text`
    color: #fff;
    font-size: 18px;
    font-weight: bold;
`;