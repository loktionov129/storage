#include <iostream>
#include <utility>
#include <vector>

class Tag {
    int _value;

public:
    explicit Tag(int value) :
        _value(value)
    {}

    [[nodiscard]] int getValue() const {
        return this->_value;
    }
};

class Printer {
public:
    virtual void print(const Tag& tag) const = 0;
};

class ConsolePrinter : public Printer {
public:
    void print(const Tag& tag) const override {
        std::cout << tag.getValue() << std::endl;
    }
};

class Truthy {
public:

    [[nodiscard]] virtual bool isTruthy(int num) const {
        return false;
    }
};

class DivCondition : public Truthy {
    int _divider;

public:
    explicit DivCondition(int divider) :
        _divider(divider)
    {}

    [[nodiscard]] bool isTruthy(int num) const override {
        return num % this->_divider == 0;
    }
};

class Strategy : public Truthy {};

class AndStrategy : public Strategy {
    std::vector<Truthy> _truthies;

public:
    explicit AndStrategy(std::vector<Truthy>  truthies) :
        _truthies(std::move(truthies))
    {}

    [[nodiscard]] bool isTruthy(int num) const override {
        for (const auto & _truthie : this->_truthies) {
            if (!_truthie.isTruthy(num)) {
                return false;
            }
        }

        return true;
    }
};

class Rule {
public:
    [[nodiscard]] virtual bool isSuccess(int num) const {
        return false;
    }

    [[nodiscard]] virtual Tag getTag() const {
        return Tag(0);
    }
};

class TagNumRule : public Rule {
    Tag _tag;
    Strategy _strategy;

public:
    TagNumRule(Tag tag, Strategy  strategy) :
        _tag(std::move(tag)),
        _strategy(std::move(strategy))
    {}

    [[nodiscard]] bool isSuccess(int num) const override {
        return this->_strategy.isTruthy(num);
    }

    [[nodiscard]] Tag getTag() const override {
        return this->_tag;
    }
};

class TagNumRulesCollection {
    std::vector<Rule> _rules;

public:
    explicit TagNumRulesCollection(std::vector<Rule>  rules) :
        _rules(std::move(rules))
    {}

    [[nodiscard]] Tag find(int num, const Tag& defaultTag) const {
        for (const auto& rule : this->_rules) {
            if (rule.isSuccess(num)) {
                return rule.getTag();
            }
        }

        return defaultTag;
    }
};

class FizzBuzz {
    int _count;
    TagNumRulesCollection* _rulesCollection{};

public:
    explicit FizzBuzz(int count) :
        _count(count)
    {
        std::vector<Truthy> fizzConditions = { DivCondition(3)} ;
        std::vector<Truthy> buzzConditions = { DivCondition(5) };
        std::vector<Truthy> fizzBuzzConditions = { DivCondition(3), DivCondition(5) };

        std::vector<Rule> rules = {
            TagNumRule(
                Tag(-3),
                AndStrategy(fizzConditions)
            ),
            TagNumRule(
                Tag(-5),
                AndStrategy(buzzConditions)
            ),
            TagNumRule(
                Tag(-15),
                AndStrategy(fizzBuzzConditions)
            )
        };
        this->_rulesCollection = new TagNumRulesCollection(rules);
    }

    ~FizzBuzz() {
        delete this->_rulesCollection;
    }

    void print(const Printer& printer) const {
        for (int num = 1; num < this->_count; ++num) {
            printer.print(this->_rulesCollection->find(num, Tag(num)));
        }
    }
};

int main (int argc, char** argv) {
    FizzBuzz fizzBuzz(100);

    fizzBuzz.print(ConsolePrinter());

    return 0; // https://www.youtube.com/watch?v=TWmmfDvcYO0&ab_channel=S0ER
}
