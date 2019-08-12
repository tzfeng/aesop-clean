from ontology.builtins import concat, state
from ontology.builtins import len
from ontology.interop.Ontology.Runtime import Base58ToAddress
from ontology.interop.System.App import RegisterAppCall, DynamicAppCall
from ontology.interop.System.ExecutionEngine import GetExecutingScriptHash
from ontology.interop.System.Runtime import Notify, Serialize, Deserialize, CheckWitness, GetTime
from ontology.interop.System.Storage import Put, Get, GetContext, Delete
from ontology.interop.Ontology.Native import Invoke
from ontology.libont import bytearray_reverse

# keys and prefixes for data storage onchain
BETKEY = 'Bets'  # the current bet key
PI_PREFIX = 'PI'  # profile information

USER_EXIST_PREFIX = bytearray(b'\x01')
UN_EXIST_PREFIX = bytearray(b'\x02')
REPKEY_PREFIX = bytearray(b'\x03')
TOKEN_BALANCE = bytearray(b'\x04')
ACTIVE_BET_PREFIX = bytearray(b'\x05')
BET_DETAILS_PREFIX = bytearray(b'\x06')
BET_CONTENT_PREFIX = bytearray(b'\x07')
VOTE_PREFIX = bytearray(b'\x10')
BET_VOTERS_LIST = "BVL"


ctx = GetContext()
AES_FACTOR = 100000000
ONG_FACTOR = 1000000000
contract_address = GetExecutingScriptHash()
contract_address_ONG = bytearray(b'\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x02')

# call OEP4 contract for transfer of tokens
RepContract = RegisterAppCall('7f0ac00575b34c1f8a4fd4641f6c58721f668fd4', 'operation', 'args')
token_owner = Base58ToAddress('ANXE3XovCwBH1ckQnPc6vKYiTwRXyrVToD')

VOTES_PER_BET = 500

def Main(operation, args):
    if operation == 'init':
        return init()

    if operation == 'aes_supply':
        return aes_supply()

    if operation == 'ong_supply':
        return ong_supply()

    if operation == 'create_user':
        if len(args) != 3:
            return False
        address = args[0]
        username = args[1]
        bio = args[2]
        return create_user(address, username, bio)

    if operation == 'purchase_token':
        if len(args) != 2:
            return False
        address = args[0]
        amount = args[1]
        return purchase_token(address, amount)

    if operation == 'redeem_ong':
        if len(args) != 2:
            return False
        address = args[0]
        amount = args[1]
        return redeem_ong(address, amount)

    if operation == 'view_rep':
        if len(args) != 1:
            return False
        address = args[0]
        return view_rep(address)

    if operation == 'view_token':
        if len(args) != 1:
            return False
        address = args[0]
        return view_token(address)

    if operation == 'view_ong':
        if len(args) != 1:
            return False
        address = args[0]
        return view_ong(address)

    # will change seconds to an actual date, depending on oracle
    if operation == 'create_bet':
        if len(args) != 7:
            return False
        address = args[0]
        amount_staked = args[1]
        stock_ticker = args[2]
        sign = args[3]
        margin = args[4]
        date = args[5]
        init_price = args[6]
        return create_bet(address, amount_staked, stock_ticker, sign, margin, date, init_price)


    if operation == 'vote':
        if len(args) != 4:
            return False
        bet = args[0]
        address = args[1]
        amount_staked = args[2]
        for_against = args[3]
        return vote(bet, address, amount_staked, for_against)


    if operation == 'payout':
        if len(args) != 2:
            return False
        bet = args[0]
        current_price = args[1]
        return payout(bet, current_price)


    if operation == 'profile':
        if len(args) != 1:
            return False
        address = args[0]
        return profile(address)


# initialize all necessary data structures to be stored onchain
def init():
    assert (not Get(ctx, BETKEY))
    BETID = 1
    Put(ctx, BETKEY, BETID)

    aes_amount = 10000 * AES_FACTOR
    assert(deposit(token_owner, aes_amount))

    ong_amount = 1000 * ONG_FACTOR
    assert (deposit_ong(token_owner, ong_amount))

    Notify(['Successfully inited'])
    return True


# method to concatenate prefixes with corresponding keys
def concatkey(str1, str2):
    return concat(concat(str1, '_'), str2)
    

def withdraw_ong(address, ong_amount):
    assert (CheckWitness(address))
    assert (ong_amount >= 0)
    params = state(contract_address, address, ong_amount)
    res = Invoke(0, contract_address_ONG, 'transfer', [params])
    assert (res)
    Notify(["depositONG", address, ong_amount])
    return True


def deposit_ong(address, ong_amount):
    assert (CheckWitness(address))
    assert (ong_amount >= 0)
    params = state(address, contract_address, ong_amount)
    res = Invoke(0, contract_address_ONG, 'transfer', [params])
    assert (res)
    Notify(["depositONG", address, ong_amount])
    return True


def withdraw(address, amount):
    assert (amount >= 0)
    assert (aes_supply() >= amount)

    res = RepContract('transfer', [contract_address, address, amount])
    assert (res)
    Notify(["withdraw", address, amount])
    return True


def deposit(address, amount):
    # do the legal checks
    assert (CheckWitness(address))
    assert (amount >= 0)
    # transfer reputation token from address to the contract account
    res = RepContract('transfer', [address, contract_address, amount])
    assert (res)
    # notify the event
    Notify(["deposit", address, amount])

    return True


def aes_supply():
    aesContractHash = "7f0ac00575b34c1f8a4fd4641f6c58721f668fd4"
    return DynamicAppCall(bytearray_reverse(aesContractHash), "balanceOf", [contract_address])


def ong_supply():
    return Invoke(0, contract_address_ONG, 'balanceOf', [contract_address])


def get_address_by_username(username):
    return Get(ctx, concatkey(username, UN_EXIST_PREFIX))


def user_exist(address):
    return Get(ctx, concatkey(address, PI_PREFIX))


# create a user and give 100 free rep. Store corresponding info onchain
def create_user(address, username, bio):
    # only the address can invoke the method
    assert (CheckWitness(address))
    # check if username has been created. if not, initialize it. Otherwise, rollback the transaction
    assert (not user_exist(address))
    # check if user has been created. if not, initialize it. Otherwise, rollback the transaction
    assert (not get_address_by_username(username))

    # mark username as being used one
    Put(ctx, concatkey(username, UN_EXIST_PREFIX), address)

    if len(bio) > 100:
        Notify(['Bio length exceeds 100 characters'])

    # create profile info list
    profile = [username, bio]
    profile_info = Serialize(profile)
    Put(ctx, concatkey(address, PI_PREFIX), profile_info)

    # update reputation of address
    Put(ctx, concatkey(address, REPKEY_PREFIX), (100 + 100000000) * AES_FACTOR)

    # distribute a certain amount of token to the newly registered user
    token_amount = 100 * AES_FACTOR
    assert (withdraw(address, token_amount))

    Notify(["userCreated", address, username, bio])
    return True


# allow an existing user to purchase more rep, only modified bank_map and actual wallet
def purchase_token(address, token_amount):
    assert (CheckWitness(address))

    assert (aes_supply() >= token_amount)

    # make sure the user is the registered one
    assert (user_exist(address))
    # transfer token to address
    assert (withdraw(address, token_amount))
    assert (deposit_ong(address, token_amount * 10))

    Notify(["purchaseToken", address, token_amount])
    return True


# allow a user to redeem their AES into ONG
def redeem_ong(address, token_amount):
    assert (CheckWitness(address))

    ong_amount = token_amount * 10
    assert (ong_supply() >= ong_amount)

    # make sure user has been created.
    assert (user_exist(address))
    assert (deposit(address, token_amount))
    assert (withdraw_ong(address, ong_amount))

    Notify(["redeemONG", address, ong_amount])
    return True


# function to view the rep of a particular user
def view_rep(address):
    return Get(ctx, concatkey(address, REPKEY_PREFIX))
    
# view user's token
def view_token(address):
    if user_exist(address):
        return RepContract('balanceOf', state(address))
    else: 
        return False

# view user's ong in user tab
def view_ong(address):
    if user_exist(address):
        return Invoke(0, contract_address_ONG, 'balanceOf', state(address))
    else:
        return False


def check_bet_status(betId):
    """
    :param betId:
    :return:
    0 means doesn't exist,
    1 means created and user can vote,
    2 means voting period ends yet not pay out,
    3 means end and payout.
    """
    active_res = Get(ctx, concatkey(betId, ACTIVE_BET_PREFIX))
    if not active_res:
        return 0
    if GetTime() <= get_vote_end_time(betId):
        return 1
    else:
        if active_res != 3:
            return 2
        return active_res


def get_user_repution(address):
    return Get(ctx, concatkey(address, REPKEY_PREFIX))


def get_latest_bet():
    return Get(ctx, BETKEY)


def get_bet_details(betId):
    if betId > get_latest_bet():
        return 0
    bet_details_info = Get(ctx, concatkey(betId, BET_DETAILS_PREFIX))
    bet_details = Deserialize(bet_details_info)
    return [bet_details["sign"], bet_details["margin"], bet_details["target_price"], bet_details["vote_end_time"], bet_details["stock_ticker"]]


def get_vote_end_time(betId):
    if betId > get_latest_bet():
        return 0
    bet_details_info = Get(ctx, concatkey(betId, BET_DETAILS_PREFIX))
    bet_details = Deserialize(bet_details_info)
    return bet_details["vote_end_time"]


# change timing to month/date/yr + exceptions
# creates a bet, storing necessary info onchain and putting the user on the "for" side of the bet
def create_bet(address, amount_staked, stock_ticker, sign, margin, date, init_price):

    assert (CheckWitness(address))

    # check if user list exists
    assert (user_exist(address))


    # update bet details
    target_price = init_price + init_price * sign * margin / 100
    bet_details = {
        "sign": sign,
        "margin": margin,
        "target_price": target_price,
        "vote_end_time": date,
        "stock_ticker": stock_ticker,
    }
    new_bet = get_latest_bet() + 1
    Put(ctx, concatkey(new_bet, BET_DETAILS_PREFIX), Serialize(bet_details))
    # update latest bet
    Put(ctx, BETKEY, new_bet)
    bet_for_map = {
        "reputation": get_user_repution(address),
        "count": 1,
        "staked": amount_staked
    }
    bet_against_map = {
        "reputation": 0,
        "count": 0,
        "staked": 0
    }
    Put(ctx, concatkey(new_bet, concatkey(1, BET_CONTENT_PREFIX)), Serialize(bet_for_map))
    Put(ctx, concatkey(new_bet, concatkey(0, BET_CONTENT_PREFIX)), Serialize(bet_against_map))

    Put(ctx, concatkey(new_bet, concatkey(address, concatkey(1, VOTE_PREFIX))), amount_staked)

    Put(ctx, concatkey(new_bet, concatkey(1, BET_VOTERS_LIST)), Serialize([address]))

    # mark the new bet as active bet
    Put(ctx, concatkey(new_bet, ACTIVE_BET_PREFIX), 1)

    assert (deposit(address, amount_staked))

    Notify(["betCreated", address, stock_ticker, sign, margin, date, init_price])

    return True


def get_for_avg_reputation(betId):
    bet_content_info = Get(ctx, concatkey(betId, concatkey(1, BET_CONTENT_PREFIX)))
    if not bet_content_info:
        return False
    bet_content = Deserialize(bet_content_info)
    return bet_content["reputation"] / bet_content["count"]


def get_bet_content(betId, for_against):
    assert (for_against == 0 or for_against == 1)
    assert (check_bet_status(betId) > 0)
    bet_content_info = Get(ctx, concatkey(betId, concatkey(for_against, BET_CONTENT_PREFIX)))
    assert (bet_content_info)
    bet_content = Deserialize(bet_content_info)
    return [bet_content["reputation"], bet_content["count"], bet_content["staked"]]


def get_probability(betId):
    assert (check_bet_status(betId) > 0)
    res = get_bet_content(betId, 1)
    for_amount_staked = res[2]
    res = get_bet_content(betId, 0)
    against_amount_staked = res[2]
    return for_amount_staked / (for_amount_staked + against_amount_staked) * 100


def get_bet_voters(betId, for_against):
    bet_voter_list_info = Get(ctx, concatkey(betId, concatkey(for_against, BET_VOTERS_LIST)))
    if not bet_voter_list_info:
        return []
    else:
        return Deserialize(bet_voter_list_info)


def get_voter_staked_amount(betId, address, for_against):
    return Get(ctx, concatkey(betId, concatkey(address, concatkey(for_against, VOTE_PREFIX))))
    
def get_all_voters(betId):
    options = [True, False]
    all_voters = []
    for option in options:
        bet_voter_list_info = Get(ctx, concatkey(betId, concatkey(option, BET_VOTERS_LIST)))    
        if bet_voter_list_info:
            voters = Deserialize(bet_voter_list_info)
            for voter in voters:
                all_voters.append(voter)
    
    Notify([all_voters])
    return all_voters

# votes on a side of the bet and immediately updates relevant data structures
def vote(bet, address, amount_staked, for_against):
    assert (CheckWitness(address))

    # check if active bet list is populated/exists
    assert (check_bet_status(bet) == 1)
    assert (user_exist(address))

    assert (for_against == False or for_against == True)

    if not get_voter_staked_amount(bet, address, for_against):
        Put(ctx, concatkey(bet, concatkey(address, concatkey(for_against, VOTE_PREFIX))), amount_staked)
        bet_voters = get_bet_voters(bet, for_against)
        Put(ctx, concatkey(bet, concatkey(for_against, BET_VOTERS_LIST)), Serialize(bet_voters.append(address)))
        versa_bet_voters = get_bet_voters(bet, 1 - for_against)
        assert (len(bet_voters) + len(versa_bet_voters) <= VOTES_PER_BET)
    else:
        Put(ctx, concatkey(bet, concatkey(address, concatkey(for_against, VOTE_PREFIX))), get_voter_staked_amount(bet, address, for_against) + amount_staked)


    bet_content_info = Get(ctx, concatkey(bet, concatkey(for_against, BET_CONTENT_PREFIX)))

    bet_content = Deserialize(bet_content_info)
    bet_content["reputation"] += get_user_repution(address)
    bet_content["count"] += 1
    bet_content["staked"] += amount_staked
    Put(ctx, concatkey(bet, concatkey(for_against, BET_CONTENT_PREFIX)), Serialize(bet_content))


    assert (deposit(address, amount_staked))
    Notify(["vote", bet, address, amount_staked, for_against])
    return True


def return_money(bet):
    vote_options = [True, False]
    for vote_option in vote_options:
        bet_voters = get_bet_voters(bet, vote_option)
        for voter in bet_voters:
            voter_staked_amount = get_voter_staked_amount(bet, voter, True)
            assert (withdraw(voter, voter_staked_amount))
    return True


# distributes staked rep based on result of bet
def distribute(bet, result):
    """
    :param bet:
    :param result: 0 means bet_against win, 1 mean bet_for win, 2 means draw,
    :return:
    """
    # check if active bet list is populated/exists
    assert (check_bet_status(bet) == 2)


    # case in which bet is a draw
    if result == 2:
        assert (return_money(bet))
        Notify(["distribute", bet, result])
        return True

    assert (result == 1 or result == 0)

    winners_list = get_bet_voters(bet, result)
    win_bet_content = get_bet_content(bet, result)
    losers_list = get_bet_content(bet, 1 - result)
    lose_bet_content = get_bet_content(bet, 1 - result)
    win_stake = win_bet_content[2]
    lose_stake = lose_bet_content[2]


    for winner in winners_list:
        # distribute and update winners' rep, bank, wallet
        winner_staked_amount = get_voter_staked_amount(bet, winner, result)
        winnings = winner_staked_amount + winner_staked_amount * lose_stake / win_stake
        # update the winner's reputation
        reputation_increasement = winner_staked_amount * lose_stake / win_stake
        Put(ctx, concatkey(winner, REPKEY_PREFIX), get_user_repution(winner) + reputation_increasement)
        assert (withdraw(winner, winnings))

    # only need to update losers' rep - bank and wallet updated already during staking
    for loser in losers_list:
        # update the loser's reputation
        loser_staked_amount = get_voter_staked_amount(bet, loser, 1 - result)
        Put(ctx, concatkey(loser, REPKEY_PREFIX), get_user_repution(loser) - loser_staked_amount)

    Notify(["distribute", bet, result])
    return True


# checks the result of the bet's prediction
def check_result(betId, current_price):
    """
    :param bet:
    :param current_price:
    :return: 0 means against wins, 1 means for wins, 2 means a draw, 3 means bet inactive
    """
    if not Get(ctx, concatkey(betId, ACTIVE_BET_PREFIX)):
        return 3

    # sign, margin, target_price, vote_end_time, stock_ticker
    bet_details = get_bet_details(betId)
    assert (len(bet_details) == 5)
    sign = bet_details[0]
    margin = bet_details[1]
    target_price = bet_details[2]

    if margin == 0 and current_price == target_price:
        return 2
    # case where user bets that stock will rise
    if sign > 0 and current_price >= target_price:
        return 1
    # case where user bets that stock will fall
    if sign < 0 and current_price <= target_price:
        return 1
    return 0


# carries out distribute function given the current price, uses check_result
def payout(bet, current_price):
    # check if active bet list is populated/exists
    assert (check_bet_status(bet) == 2)


    against_voters_list = get_bet_voters(bet, 0)
    if len(against_voters_list) > 0:
        final_result = check_result(bet, current_price)
        assert (distribute(bet, final_result))
        return True

    else:
        assert (return_money(bet))
        return True



def profile(address):
    profile_info = Get(ctx, concatkey(address, PI_PREFIX))
    if profile_info:
        profile = Deserialize(profile_info)
        # profile = [username, bio]
        return profile
    return False
