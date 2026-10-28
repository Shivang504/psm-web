import { takeLatest } from 'redux-saga/effects'
import { sagaActions } from '@/store/actions'
import { genericSaga } from '@/store/sagas/genericSaga/genericSaga'

export function* ordersSaga() {
  yield takeLatest(sagaActions.GET_ORDERS, genericSaga)
  yield takeLatest(sagaActions.GET_ORDER, genericSaga)
  yield takeLatest(sagaActions.GET_ORDER_REPORT, genericSaga)
  yield takeLatest(sagaActions.UPDATE_ORDER, genericSaga)
  yield takeLatest(sagaActions.DELETE_ORDER_PRODUCT, genericSaga)
}
