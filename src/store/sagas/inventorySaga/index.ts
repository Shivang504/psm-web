import { takeLatest } from 'redux-saga/effects'
import { sagaActions } from '@/store/actions'
import { genericSaga } from '@/store/sagas/genericSaga/genericSaga'

export function* inventorySaga() {
  yield takeLatest(sagaActions.GET_CATEGORIES, genericSaga)
  yield takeLatest(sagaActions.ADD_CATEGORY, genericSaga)
  yield takeLatest(sagaActions.UPDATE_CATEGORY, genericSaga)
  yield takeLatest(sagaActions.DELETE_CATEGORY, genericSaga)
  yield takeLatest(sagaActions.GET_INVENTORY_PRODUCTS, genericSaga)
  yield takeLatest(sagaActions.ADD_INVENTORY_PRODUCT, genericSaga)
  yield takeLatest(sagaActions.UPDATE_INVENTORY_PRODUCT, genericSaga)
  yield takeLatest(sagaActions.DELETE_INVENTORY_PRODUCT, genericSaga)
  yield takeLatest(sagaActions.UPDATE_INVENTORY_PRODUCT_STATUS, genericSaga)
  yield takeLatest(sagaActions.GET_PACKAGES, genericSaga)
  yield takeLatest(sagaActions.GET_STOCKS, genericSaga)
  yield takeLatest(sagaActions.ADD_STOCKS, genericSaga)
  yield takeLatest(sagaActions.UPDATE_STOCK, genericSaga)
  yield takeLatest(sagaActions.DELETE_STOCK, genericSaga)
  yield takeLatest(sagaActions.GET_PRICE_LIST, genericSaga)
  yield takeLatest(sagaActions.ADD_PRICE, genericSaga)
  yield takeLatest(sagaActions.UPDATE_PRICE, genericSaga)
  yield takeLatest(sagaActions.DELETE_PRICE, genericSaga)
}
